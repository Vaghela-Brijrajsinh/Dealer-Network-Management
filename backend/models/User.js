
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true
        },
        district: {
            type: String,
            required: true,
            trim: true
        },
        taluka: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        pincode: {
            type: String,
            required: true,
            trim: true
        },
        shopName: {
            type: String,
            required: true,
            trim: true
        },// Phone number validation and duplicate prevention
phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\d{10}$/, "Phone number must contain exactly 10 digits."]
},
        address: {
            type: String,
            required: true,
            trim: true
        },
        gstNumber: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },
        role: {
            type: String,
            default: "dealer"
        },
        approved: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);

