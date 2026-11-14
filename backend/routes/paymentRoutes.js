const express = require("express");
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const User = require("../models/User");
const { sendPaymentApprovedEmail, sendPaymentRejectedEmail } = require("../utils/sendOTP");

const router = express.Router();

// Submit payment transaction ID / UTR (Dealer - UPI or NEFT/RTGS)
router.post("/", async function (req, res) {
    try {
        const { orderId, dealerId, amount, transactionId, paymentMethod } = req.body;

        if (!orderId || !dealerId || !amount) {
            return res.status(400).json({ message: "Order ID, Dealer ID, and Amount are required" });
        }

        const method = (paymentMethod === "NEFT_RTGS" || paymentMethod === "NEFT/RTGS")
            ? "NEFT_RTGS"
            : (paymentMethod === "COD" ? "COD" : "UPI");

        if (method === "UPI" || method === "NEFT_RTGS") {
            if (!transactionId || !String(transactionId).trim()) {
                return res.status(400).json({ message: "Transaction ID / UTR Number is required." });
            }

            const cleanTxId = String(transactionId).trim();

            if (cleanTxId.length < 4) {
                return res.status(400).json({ message: "Transaction ID / UTR must be at least 4 characters long." });
            }

            // Check if transaction ID has already been submitted in DB
            const existingTx = await Payment.findOne({ transactionId: cleanTxId });
            if (existingTx && String(existingTx.orderId) !== String(orderId)) {
                return res.status(400).json({ message: "This transaction ID has already been submitted." });
            }
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Prevent second approved payment
        let existingPayment = await Payment.findOne({ orderId: orderId });

        if (existingPayment && existingPayment.status === "approved") {
            return res.status(400).json({ message: "Payment for this order has already been approved." });
        }

        const cleanTxId = transactionId ? String(transactionId).trim() : "";

        if (existingPayment) {
            existingPayment.amount = Number(amount);
            existingPayment.paymentMethod = method;
            existingPayment.transactionId = cleanTxId;
            existingPayment.status = "verification_pending";
            await existingPayment.save();

            order.paymentStatus = "Verification Pending";
            order.paymentMethod = method;
            order.paymentId = existingPayment._id;
            await order.save();

            return res.json({
                message: "Payment details have been submitted successfully and are currently under verification.",
                payment: existingPayment
            });
        } else {
            const payment = new Payment({
                orderId: orderId,
                dealerId: dealerId,
                amount: Number(amount),
                paymentMethod: method,
                transactionId: cleanTxId,
                status: "verification_pending"
            });

            await payment.save();

            order.paymentStatus = "Verification Pending";
            order.paymentMethod = method;
            order.paymentId = payment._id;
            await order.save();

            return res.status(201).json({
                message: "Payment details have been submitted successfully and are currently under verification.",
                payment: payment
            });
        }
    } catch (error) {
        console.log("Submit payment error:", error);
        res.status(500).json({ message: "Failed to submit payment" });
    }
});

// Get payment details for an order (Dealer/Admin)
router.get("/order/:orderId", async function (req, res) {
    try {
        const payment = await Payment.findOne({ orderId: req.params.orderId });
        res.json(payment || null);
    } catch (error) {
        console.log("Fetch order payment error:", error);
        res.status(500).json({ message: "Failed to fetch payment details" });
    }
});

// Admin: Get all payment verification records
router.get("/", async function (req, res) {
    try {
        const payments = await Payment.find()
            .populate("dealerId", "name email shopName district taluka phone")
            .populate("orderId", "totalAmount items status createdAt")
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (error) {
        console.log("Fetch all payments error:", error);
        res.status(500).json({ message: "Failed to fetch payments" });
    }
});

// Admin: Approve or Reject payment
router.put("/:id/verify", async function (req, res) {
    try {
        const { action, adminId } = req.body; // action: "approve" or "reject"

        if (action !== "approve" && action !== "reject") {
            return res.status(400).json({ message: "Invalid action. Must be 'approve' or 'reject'" });
        }

        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: "Payment record not found" });
        }

        const order = await Order.findById(payment.orderId);
        if (!order) {
            return res.status(404).json({ message: "Associated order not found" });
        }

        const dealer = await User.findById(payment.dealerId);

        if (action === "approve") {
            payment.status = "approved";
            payment.verifiedAt = new Date();
            if (adminId) payment.verifiedBy = adminId;
            await payment.save();

            order.paymentStatus = "Paid";
            await order.save();

            // Send payment approval email to dealer
            if (dealer && dealer.email) {
                try {
                    sendPaymentApprovedEmail(dealer.email, {
                        dealerName: dealer.name,
                        orderId: String(order._id),
                        paymentMethod: payment.paymentMethod,
                        amount: payment.amount,
                        transactionId: payment.transactionId
                    });
                } catch (emailErr) {
                    console.log("Failed to send payment approval email:", emailErr.message);
                }
            }

            return res.json({
                message: "Payment approved successfully",
                payment: payment
            });
        } else {
            payment.status = "rejected";
            payment.verifiedAt = new Date();
            if (adminId) payment.verifiedBy = adminId;
            await payment.save();

            order.paymentStatus = "Rejected";
            await order.save();

            // Send payment rejection email to dealer
            if (dealer && dealer.email) {
                try {
                    sendPaymentRejectedEmail(dealer.email, {
                        dealerName: dealer.name,
                        orderId: String(order._id),
                        amount: payment.amount,
                        transactionId: payment.transactionId
                    });
                } catch (emailErr) {
                    console.log("Failed to send payment rejection email:", emailErr.message);
                }
            }

            return res.json({
                message: "Payment rejected",
                payment: payment
            });
        }
    } catch (error) {
        console.log("Verify payment error:", error);
        res.status(500).json({ message: "Failed to process payment approval" });
    }
});

// Admin: Delete payment record from Mongo DB
router.delete("/:id", async function (req, res) {
    try {
        const payment = await Payment.findByIdAndDelete(req.params.id);

        if (!payment) {
            return res.status(404).json({ message: "Payment record not found" });
        }

        // If order exists and references this payment, update order's paymentStatus back to Pending or reset paymentId
        const order = await Order.findById(payment.orderId);
        if (order && String(order.paymentId) === String(payment._id)) {
            order.paymentStatus = "Pending";
            order.paymentId = null;
            await order.save();
        }

        res.json({ message: "Payment record deleted successfully from database" });
    } catch (error) {
        console.log("Delete payment error:", error);
        res.status(500).json({ message: "Failed to delete payment record" });
    }
});

module.exports = router;
