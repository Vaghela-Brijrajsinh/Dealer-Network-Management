const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    dealerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    dealerName: {
        type: String,
        required: true
    },

    shopName: {
        type: String,
        default: ""
    },

    items: [
        {
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
                required: true
            },

            price: {
                type: Number,
                required: true
            }
        }
    ],

    totalAmount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        default: "Pending"
    },

    paymentMethod: {
        type: String,
        enum: ["UPI", "NEFT_RTGS", "NEFT/RTGS", "COD"],
        default: "UPI"
    },

    paymentStatus: {
        type: String,
        default: "Pending" // Pending, Verification Pending, Paid, Rejected
    },

    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment"
    }

}, {
    timestamps: true
});


module.exports = mongoose.model("Order", orderSchema);