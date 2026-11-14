const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },

        orderNumber: {
            type: String,
            default: ""
        },

        dealerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        transportName: {
            type: String,
            required: true
        },

        vehicleNumber: {
            type: String,
            required: true
        },

        driverName: {
            type: String,
            required: true
        },

        dispatchDate: {
            type: String,
            default: ""
        },

        expectedDate: {
            type: String,
            default: ""
        },

        deliveredDate: {
            type: String,
            default: ""
        },

        status: {
            type: String,

            enum: [
                "Preparing",
                "Dispatched",
                "Delivered"
            ],

            default: "Preparing"
        }
    },

    {
        timestamps: true
    }
);

module.exports = mongoose.model("Shipment", shipmentSchema);