const express = require("express");
const mongoose = require("mongoose");

const Complaint = require("../models/Complaint");
const Order = require("../models/Order");
const Product = require("../models/Product");

const router = express.Router();


// =====================================================
// DEALER: CREATE COMPLAINT
// =====================================================

router.post("/", async function (req, res) {

    try {

        const {
            dealerId,
            orderId,
            productId,
            quantity,
            reason,
            description
        } = req.body;


        const cleanReason = reason ? String(reason).trim() : "";
        const cleanDescription = description ? String(description).trim() : "";

        if (
            !dealerId ||
            !orderId ||
            !productId ||
            !quantity ||
            !cleanReason ||
            !cleanDescription
        ) {
            return res.status(400).json({
                message: "All fields are required to raise a complaint"
            });
        }


        if (
            !mongoose.Types.ObjectId.isValid(
                dealerId
            ) ||
            !mongoose.Types.ObjectId.isValid(
                orderId
            ) ||
            !mongoose.Types.ObjectId.isValid(
                productId
            )
        ) {

            return res.status(400).json({
                message:
                    "Invalid dealer, order, or product ID"
            });

        }


        const order =
            await Order.findById(
                orderId
            );


        if (!order) {

            return res.status(404).json({
                message:
                    "Order not found"
            });

        }


        // =============================================
        // CHECK DEALER OWNERSHIP
        // =============================================

        if (
            String(order.dealerId) !==
            String(dealerId)
        ) {

            return res.status(403).json({
                message:
                    "You can only raise complaints for your own orders"
            });

        }


        // =============================================
        // ONLY DELIVERED ORDERS
        // =============================================

        if (
            order.status !== "Delivered"
        ) {

            return res.status(400).json({
                message:
                    "Complaints can only be raised for Delivered orders"
            });

        }


        // =============================================
        // CHECK PRODUCT IS IN ORDER
        // =============================================

        const orderItem =
            order.items.find(
                function (item) {

                    return String(
                        item.productId
                    ) === String(
                        productId
                    );

                }
            );


        if (!orderItem) {

            return res.status(400).json({
                message:
                    "This product is not part of the selected order"
            });

        }


        const complaintQuantity =
            Number(quantity);


        if (
            !Number.isInteger(
                complaintQuantity
            ) ||
            complaintQuantity < 1
        ) {

            return res.status(400).json({
                message:
                    "Invalid complaint quantity"
            });

        }


        if (
            complaintQuantity >
            orderItem.quantity
        ) {

            return res.status(400).json({
                message:
                    "Complaint quantity cannot exceed ordered quantity"
            });

        }


        // =============================================
        // PRODUCT
        // =============================================

        const product =
            await Product.findById(
                productId
            );


        // =============================================
        // COMPLAINT NUMBER
        // =============================================

        const randomPart =
            Math.floor(
                1000 +
                Math.random() *
                9000
            );


        const complaintNumber =
            "CMP-" +
            randomPart;


        const complaint =
            new Complaint({

                complaintNumber:
                    complaintNumber,

                dealerId:
                    dealerId,

                orderId:
                    orderId,

                orderNumber:
                    order.orderNumber,

                productId:
                    productId,

                productName:
                    product
                        ? product.name
                        : orderItem.productName,

                quantity:
                    complaintQuantity,

                reason:
                    reason,

                description:
                    description,

                status:
                    "Open"

            });


        await complaint.save();


        res.status(201).json({

            message:
                "Complaint raised successfully. Status: Open",

            complaint:
                complaint

        });


    } catch (error) {

        console.log(
            "Raise complaint error:",
            error
        );


        res.status(500).json({
            message:
                "Failed to submit complaint"
        });

    }

});


// =====================================================
// ADMIN: GET ALL COMPLAINTS
// =====================================================

router.get("/", async function (req, res) {

    try {

        const complaints =
            await Complaint
                .find()
                .sort({
                    createdAt: -1
                });


        res.json(
            complaints
        );


    } catch (error) {

        console.log(
            "Get complaints error:",
            error
        );


        res.status(500).json({
            message:
                "Failed to fetch complaints"
        });

    }

});


// =====================================================
// DEALER: GET OWN COMPLAINTS
// =====================================================

router.get(
    "/dealer/:dealerId",
    async function (req, res) {

        try {

            const dealerId =
                req.params.dealerId;


            if (
                !mongoose.Types.ObjectId.isValid(
                    dealerId
                )
            ) {

                return res.status(400).json({
                    message:
                        "Invalid dealer ID"
                });

            }


            const complaints =
                await Complaint.find({

                    dealerId:
                        new mongoose.Types.ObjectId(
                            dealerId
                        )

                }).sort({

                    createdAt: -1

                });


            res.json(
                complaints
            );


        } catch (error) {

            console.log(
                "Get dealer complaints error:",
                error
            );


            res.status(500).json({
                message:
                    "Failed to fetch your complaints"
            });

        }

    }
);


// =====================================================
// GET SINGLE COMPLAINT
// =====================================================

router.get(
    "/:id",
    async function (req, res) {

        try {

            const complaint =
                await Complaint.findById(
                    req.params.id
                );


            if (!complaint) {

                return res.status(404).json({
                    message:
                        "Complaint not found"
                });

            }


            res.json(
                complaint
            );


        } catch (error) {

            console.log(
                "Get complaint error:",
                error
            );


            res.status(500).json({
                message:
                    "Failed to fetch complaint details"
            });

        }

    }
);


// =====================================================
// ADMIN: UPDATE COMPLAINT STATUS
// =====================================================

router.patch(
    "/:id/status",
    async function (req, res) {

        try {

            const {
                status
            } = req.body;


            const allowedStatuses = [

                "Open",

                "Under Review",

                "Approved",

                "Rejected",

                "Resolved"

            ];


            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({
                    message:
                        "Invalid complaint status"
                });

            }


            const complaint =
                await Complaint.findById(
                    req.params.id
                );


            if (!complaint) {

                return res.status(404).json({
                    message:
                        "Complaint not found"
                });

            }


            complaint.status =
                status;


            await complaint.save();


            res.json({

                message:
                    "Complaint status updated to " +
                    status,

                complaint:
                    complaint

            });


        } catch (error) {

            console.log(
                "Update complaint status error:",
                error
            );


            res.status(500).json({
                message:
                    "Failed to update complaint status"
            });

        }

    }
);


// =====================================================
// ADMIN: DELETE COMPLAINT FROM MONGO DB
// =====================================================

router.delete("/:id", async function (req, res) {
    try {
        const complaint = await Complaint.findByIdAndDelete(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint record not found"
            });
        }

        res.json({
            message: "Complaint deleted successfully from database"
        });
    } catch (error) {
        console.log("Delete complaint error:", error);
        res.status(500).json({
            message: "Failed to delete complaint record"
        });
    }
});


module.exports = router;