const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },
        dealerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        paymentMethod: {
            type: String,
            enum: ["UPI", "NEFT_RTGS", "NEFT/RTGS", "COD"],
            default: "UPI"
        },
        transactionId: {
            type: String,
            trim: true,
            default: ""
        },
        status: {
            type: String,
            enum: ["pending", "verification_pending", "approved", "rejected"],
            default: "pending"
        },
        verifiedAt: {
            type: Date
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Payment", paymentSchema);
