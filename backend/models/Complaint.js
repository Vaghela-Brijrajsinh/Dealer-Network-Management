const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
    {
        complaintNumber: {
            type: String,
            default: ""
        },

        dealerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },

        orderNumber: {
            type: String,
            default: ""
        },

        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        productName: {
            type: String,
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        reason: {
            type: String,
            required: true // Damaged Product, Wrong Product, Missing Product, Quantity Problem, Other
        },

        description: {
            type: String,
            required: true
        },

        status: {
            type: String,
            default: "Open" // Open, Under Review, Approved, Rejected, Resolved
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Complaint", complaintSchema);
