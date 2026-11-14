
const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Payment = require("../models/Payment");
const { sendOrderApprovedEmail } = require("../utils/sendOTP");

const router = express.Router();

// DEALER: PLACE NEW ORDER
router.post("/", async function (req, res) {
    try {
        const { dealerId, items, paymentMethod } = req.body;
        const method = paymentMethod === "COD"
            ? "COD"
            : (paymentMethod === "NEFT_RTGS" || paymentMethod === "NEFT/RTGS")
                ? "NEFT_RTGS"
                : "UPI";

        if (!dealerId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Cart items and dealer information are required"
            });
        }

        const dealer = await User.findById(dealerId);

        if (!dealer) {
            return res.status(404).json({
                message: "Dealer not found"
            });
        }

        if (dealer.role === "dealer" && dealer.approved !== true) {
            return res.status(403).json({
                message: "Your account is waiting for admin approval."
            });
        }

        const orderItems = [];

        for (const item of items) {
            const quantity = Number(item.quantity);

            if (!item.productId || !Number.isInteger(quantity) || quantity < 1) {
                return res.status(400).json({
                    message: "Product ID and valid quantity are required"
                });
            }

            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            if (quantity > product.stock) {
                return res.status(400).json({
                    message: product.name + ": Only " + product.stock + " products are available."
                });
            }

            orderItems.push({
                productId: product._id,
                productName: product.name,
                quantity: quantity,
                price: Number(product.price)
            });
        }

        let totalAmount = 0;

        for (const item of orderItems) {
            totalAmount = totalAmount + item.price * item.quantity;
        }

        const order = new Order({
            dealerId: dealer._id,
            dealerName: dealer.name,
            shopName: dealer.shopName || "",
            items: orderItems,
            totalAmount: totalAmount,
            status: "Pending",
            paymentMethod: method,
            paymentStatus: method === "COD" ? "Verification Pending" : "Pending"
        });

        await order.save();

        if (method === "COD") {
            const payment = new Payment({
                orderId: order._id,
                dealerId: dealer._id,
                amount: totalAmount,
                paymentMethod: "COD",
                transactionId: "COD",
                status: "verification_pending"
            });
            await payment.save();
            order.paymentId = payment._id;
            await order.save();
        }

        return res.status(201).json({
            message: method === "COD"
                ? "Order placed successfully with Cash on Delivery!"
                : "Order created successfully. Please proceed with payment.",
            order: order
        });

    } catch (error) {
        console.log("Place order error:", error);

        return res.status(500).json({
            message: "Failed to place order",
            error: error.message
        });
    }
});

// ADMIN: GET ALL ORDERS
router.get("/", async function (req, res) {
    try {
        const orders = await Order.find()
            .populate("dealerId", "-password")
            .sort({ createdAt: -1 });

        return res.json(orders);

    } catch (error) {
        console.log("Fetch orders error:", error);

        return res.status(500).json({
            message: "Failed to fetch orders",
            error: error.message
        });
    }
});

// DEALER: GET DEALER ORDERS
router.get("/dealer/:dealerId", async function (req, res) {
    try {
        const orders = await Order.find({
            dealerId: req.params.dealerId
        }).sort({
            createdAt: -1
        });

        return res.json(orders);

    } catch (error) {
        console.log("Fetch dealer orders error:", error);

        return res.status(500).json({
            message: "Failed to fetch dealer orders",
            error: error.message
        });
    }
});

// GET SINGLE ORDER BY ID
router.get("/:id", async function (req, res) {
    try {
        const order = await Order.findById(req.params.id)
            .populate("dealerId", "-password")
            .populate("paymentId");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.json(order);
    } catch (error) {
        console.log("Fetch single order error:", error);
        return res.status(500).json({ message: "Failed to fetch order details" });
    }
});

// ADMIN: APPROVE / REJECT ORDER
router.put("/:id", async function (req, res) {
    try {
        const { status } = req.body;

        if (status !== "Approved" && status !== "Rejected") {
            return res.status(400).json({
                message: "Invalid order status"
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (order.status !== "Pending") {
            return res.status(400).json({
                message: "Order has already been processed"
            });
        }

        if (status === "Rejected") {
            order.status = "Rejected";
            await order.save();

            return res.json({
                message: "Order rejected successfully",
                order: order
            });
        }

        // CHECK AND REDUCE STOCK
        for (const item of order.items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    message: item.productName + " not found"
                });
            }

            if (item.quantity > product.stock) {
                return res.status(400).json({
                    message: item.productName + ": Only " + product.stock + " products are available."
                });
            }
        }

        // REDUCE STOCK
        for (const item of order.items) {
            const product = await Product.findById(item.productId);

            product.stock = product.stock - item.quantity;

            await product.save();
        }

        order.status = "Approved";

        await order.save();

        // Send approval email to the specific dealer
        try {
            const dealer = await User.findById(order.dealerId);
            if (dealer && dealer.email) {
                sendOrderApprovedEmail(dealer.email, {
                    dealerName: dealer.name,
                    orderId: String(order._id),
                    orderDate: new Date(order.createdAt).toLocaleDateString(),
                    approvalDate: new Date().toLocaleDateString(),
                    items: order.items,
                    totalAmount: order.totalAmount
                });
            }
        } catch (emailErr) {
            console.log("Failed to send order approval email:", emailErr.message);
        }

        return res.json({
            message: "Order approved and stock updated successfully",
            order: order
        });

    } catch (error) {
        console.log("Update order error:", error);

        return res.status(500).json({
            message: "Failed to update order",
            error: error.message
        });
    }
});

// ADMIN: DELETE ORDER
router.delete("/:id", async function (req, res) {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        await Payment.deleteMany({ orderId: req.params.id });

        return res.json({
            message: "Order deleted successfully"
        });
    } catch (error) {
        console.log("Delete order error:", error);
        return res.status(500).json({
            message: "Failed to delete order"
        });
    }
});

module.exports = router;

