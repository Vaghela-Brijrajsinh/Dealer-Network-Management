const express = require("express");
const mongoose = require("mongoose");

const Shipment = require("../models/Shipment");
const Order = require("../models/Order");
const User = require("../models/User");
const { sendShipmentCreatedEmail, sendShipmentDeliveredEmail } = require("../utils/sendOTP");

const router = express.Router();


// =====================================================
// ADMIN: CREATE SHIPMENT
// =====================================================

router.post("/", async function (req, res) {
    try {
        const {
            orderId,
            transportName,
            vehicleNumber,
            driverName,
            expectedDate
        } = req.body;

        const cleanTransport = transportName ? String(transportName).trim() : "";
        const cleanVehicle = vehicleNumber ? String(vehicleNumber).trim() : "";
        const cleanDriver = driverName ? String(driverName).trim() : "";

        if (
            !orderId ||
            !cleanTransport ||
            !cleanVehicle ||
            !cleanDriver
        ) {
            return res.status(400).json({
                message: "Order ID, transport name, vehicle number, and driver name are required"
            });
        }

        const driverNamePattern = /^[A-Za-z\s]+$/;
        if (!driverNamePattern.test(cleanDriver) || cleanDriver.length < 2) {
            return res.status(400).json({
                message: "Driver name must contain alphabets and spaces only."
            });
        }

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                message: "Invalid order ID"
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (order.status !== "Approved") {
            return res.status(400).json({
                message: "Shipments can only be created for Approved orders"
            });
        }

        // Prevent duplicate shipment
        const existingShipment = await Shipment.findOne({
            orderId: order._id
        });

        if (existingShipment) {
            return res.status(400).json({
                message: "Shipment already exists for this order"
            });
        }

        const dateStr = new Date().toLocaleDateString();

        const shipment = new Shipment({
            orderId: order._id,
            orderNumber: order.orderNumber,
            dealerId: order.dealerId,
            transportName: cleanTransport,
            vehicleNumber: cleanVehicle,
            driverName: cleanDriver,
            dispatchDate: dateStr,
            expectedDate: expectedDate ? String(expectedDate).trim() : "Within 3-5 days",
            status: "Preparing"
        });

        await shipment.save();

        // Send email notification to dealer
        try {
            const dealer = await User.findById(order.dealerId);
            if (dealer && dealer.email) {
                sendShipmentCreatedEmail(dealer.email, {
                    dealerName: dealer.name,
                    orderId: String(order._id),
                    shipmentId: String(shipment._id),
                    transportName: cleanTransport,
                    vehicleNumber: cleanVehicle,
                    driverName: cleanDriver,
                    dispatchDate: dateStr,
                    expectedDate: shipment.expectedDate
                });
            }
        } catch (emailErr) {
            console.log("Failed to send shipment creation email:", emailErr.message);
        }

        res.status(201).json({
            message: "Shipment created successfully",
            shipment: shipment
        });

    } catch (error) {
        console.log("Create shipment error:", error);
        res.status(500).json({
            message: "Failed to create shipment"
        });
    }
});


// ADMIN: GET ALL SHIPMENTS
router.get("/", async function (req, res) {
    try {
        const shipments = await Shipment.find()
            .populate("orderId")
            .sort({ createdAt: -1 });

        res.json(shipments);
    } catch (error) {
        console.log("Get all shipments error:", error);
        res.status(500).json({
            message: "Failed to fetch shipments"
        });
    }
});


// DEALER: GET DELIVERED ORDERS
router.get("/dealer/:dealerId/delivered", async function (req, res) {
    try {
        const dealerId = req.params.dealerId;

        if (!mongoose.Types.ObjectId.isValid(dealerId)) {
            return res.status(400).json({
                message: "Invalid dealer ID"
            });
        }

        const shipments = await Shipment.find({
            dealerId: new mongoose.Types.ObjectId(dealerId),
            status: "Delivered"
        });

        if (shipments.length === 0) {
            return res.json([]);
        }

        const orderIds = shipments.map(shipment => shipment.orderId);

        const orders = await Order.find({
            _id: { $in: orderIds },
            dealerId: new mongoose.Types.ObjectId(dealerId),
            status: "Delivered"
        }).sort({ createdAt: -1 });

        res.json(orders);

    } catch (error) {
        console.log("Get delivered orders error:", error);
        res.status(500).json({
            message: "Failed to fetch delivered orders"
        });
    }
});


// DEALER: GET OWN SHIPMENTS
router.get("/dealer/:dealerId", async function (req, res) {
    try {
        const dealerId = req.params.dealerId;

        if (!mongoose.Types.ObjectId.isValid(dealerId)) {
            return res.status(400).json({
                message: "Invalid dealer ID"
            });
        }

        const shipments = await Shipment.find({
            dealerId: new mongoose.Types.ObjectId(dealerId)
        }).sort({ createdAt: -1 });

        res.json(shipments);
    } catch (error) {
        console.log("Get dealer shipments error:", error);
        res.status(500).json({
            message: "Failed to fetch your shipments"
        });
    }
});


// GET SINGLE SHIPMENT
router.get("/:id", async function (req, res) {
    try {
        const shipment = await Shipment.findById(req.params.id);

        if (!shipment) {
            return res.status(404).json({
                message: "Shipment not found"
            });
        }

        res.json(shipment);
    } catch (error) {
        console.log("Get shipment error:", error);
        res.status(500).json({
            message: "Failed to fetch shipment details"
        });
    }
});


// ADMIN: UPDATE SHIPMENT STATUS
router.patch("/:id/status", async function (req, res) {
    try {
        const { status } = req.body;
        const allowedStatuses = ["Preparing", "Dispatched", "Delivered"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid shipment status"
            });
        }

        const shipment = await Shipment.findById(req.params.id);

        if (!shipment) {
            return res.status(404).json({
                message: "Shipment not found"
            });
        }

        const order = await Order.findById(shipment.orderId);

        if (!order) {
            return res.status(404).json({
                message: "Corresponding order not found"
            });
        }

        const oldStatus = shipment.status;

        shipment.status = status;

        if (status === "Delivered") {
            shipment.deliveredDate = new Date().toLocaleDateString();
        }

        await shipment.save();

        if (status === "Dispatched") {
            order.status = "Dispatched";
        }

        if (status === "Delivered") {
            order.status = "Delivered";
        }

        await order.save();

        // Trigger delivery email only when status becomes Delivered for the first time
        if (status === "Delivered" && oldStatus !== "Delivered") {
            try {
                const dealer = await User.findById(shipment.dealerId);
                if (dealer && dealer.email) {
                    sendShipmentDeliveredEmail(dealer.email, {
                        dealerName: dealer.name,
                        orderId: String(order._id),
                        shipmentId: String(shipment._id),
                        deliveryDate: shipment.deliveredDate,
                        totalAmount: order.totalAmount
                    });
                }
            } catch (emailErr) {
                console.log("Failed to send shipment delivery email:", emailErr.message);
            }
        }

        res.json({
            message: "Shipment status updated to " + status,
            shipment: shipment,
            order: order
        });

    } catch (error) {
        console.log("Update shipment status error:", error);
        res.status(500).json({
            message: "Failed to update shipment status"
        });
    }
});


// ADMIN: DELETE SHIPMENT
router.delete("/:id", async function (req, res) {
    try {
        const shipment = await Shipment.findByIdAndDelete(req.params.id);

        if (!shipment) {
            return res.status(404).json({ message: "Shipment not found" });
        }

        res.json({ message: "Shipment deleted successfully" });
    } catch (error) {
        console.log("Delete shipment error:", error);
        res.status(500).json({ message: "Failed to delete shipment" });
    }
});

module.exports = router;