
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Order = require("../models/Order");
const { sendApprovalEmail } = require("../utils/sendOTP");

const router = express.Router();

// =====================================================
// ADMIN: Add new dealer directly (Auto-approved by admin)
// =====================================================
router.post("/", async function (req, res) {
    try {
        const {
            name,
            email,
            password,
            confirmPassword,
            district,
            taluka,
            city,
            pincode,
            shopName,
            phone,
            address,
            gstNumber
        } = req.body;

        // Check required fields
        if (
            !name ||
            !email ||
            !password ||
            !district ||
            !taluka ||
            !pincode ||
            !shopName ||
            !phone ||
            !address ||
            !gstNumber
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Clean input values
        const cleanName = name.trim();
        const cleanEmail = email.toLowerCase().trim();
        const cleanDistrict = district.trim();
        const cleanTaluka = taluka.trim();
        const cleanCity = (city || (cleanTaluka + ", " + cleanDistrict)).trim();
        const cleanPincode = String(pincode).trim();
        const cleanShopName = shopName.trim();
        const cleanPhone = String(phone).trim();
        const cleanAddress = address.trim();
        const cleanGstNumber = gstNumber.trim().toUpperCase();

        // Validate pincode
        if (!/^\d{6}$/.test(cleanPincode)) {
            return res.status(400).json({
                message: "Pincode must contain exactly 6 digits."
            });
        }

        // Validate name
        if (cleanName.length < 2) {
            return res.status(400).json({
                message: "Name must be at least 2 characters long."
            });
        }

        // Validate email format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(cleanEmail)) {
            return res.status(400).json({
                message: "Please enter a valid email address."
            });
        }

        // Validate password
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long."
            });
        }

        // Validate confirm password when supplied
        if (confirmPassword && password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match."
            });
        }

        // Validate phone: exactly 10 digits
        if (!/^\d{10}$/.test(cleanPhone)) {
            return res.status(400).json({
                message: "Phone number must contain exactly 10 digits."
            });
        }

        // Validate GST number length
        if (cleanGstNumber.length !== 15) {
            return res.status(400).json({
                message: "GST number must contain exactly 15 characters."
            });
        }

        // Check whether email is already registered
        const existingUser = await User.findOne({
            email: cleanEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        // NEW: Check whether phone number is already registered
        const existingPhone = await User.findOne({
            phone: cleanPhone
        });

        if (existingPhone) {
            return res.status(409).json({
                message: "Phone number already registered"
            });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create dealer
        const dealer = new User({
            name: cleanName,
            email: cleanEmail,
            password: hashedPassword,
            district: cleanDistrict,
            taluka: cleanTaluka,
            city: cleanCity,
            pincode: cleanPincode,
            shopName: cleanShopName,
            phone: cleanPhone,
            address: cleanAddress,
            gstNumber: cleanGstNumber,
            role: "dealer",
            approved: true
        });

        // Save dealer to MongoDB
        await dealer.save();

        return res.status(201).json({
            message: "Dealer added successfully",
            dealer: dealer
        });

    } catch (error) {
        console.log("Add dealer error:", error);

        // Handle MongoDB duplicate-key errors
        if (error.code === 11000) {
            if (error.keyPattern?.phone) {
                return res.status(409).json({
                    message: "Phone number already registered"
                });
            }

            if (error.keyPattern?.email) {
                return res.status(409).json({
                    message: "Email already registered"
                });
            }

            return res.status(409).json({
                message: "This information is already registered"
            });
        }

        return res.status(500).json({
            message: "Failed to add dealer"
        });
    }
});


// =====================================================
// ADMIN: Get all dealers
// =====================================================
router.get("/", async function (req, res) {
    try {
        const dealers = await User.find({ role: "dealer" })
            .select("-password")
            .sort({ createdAt: -1 });

        return res.json(dealers);

    } catch (error) {
        console.log("Fetch dealers error:", error);

        return res.status(500).json({
            message: "Failed to fetch dealers"
        });
    }
});


// =====================================================
// ADMIN: Get pending dealer registration requests
// =====================================================
router.get("/requests", async function (req, res) {
    try {
        const pendingDealers = await User.find({
            role: "dealer",
            approved: false
        })
            .select("-password")
            .sort({ createdAt: -1 });

        return res.json(pendingDealers);

    } catch (error) {
        console.log("Fetch dealer requests error:", error);

        return res.status(500).json({
            message: "Failed to fetch pending dealer requests"
        });
    }
});


// =====================================================
// ADMIN: Approve or block dealer
// =====================================================
router.put("/:id", async function (req, res) {
    try {
        const dealer = await User.findById(req.params.id);

        if (!dealer) {
            return res.status(404).json({
                message: "Dealer not found"
            });
        }

        const oldApprovedStatus = dealer.approved;

        dealer.approved = req.body.approved;

        await dealer.save();

        // Send email only when approval changes from false to true
        if (oldApprovedStatus === false && dealer.approved === true) {
            try {
                await sendApprovalEmail(dealer.email, dealer.name);

                console.log(
                    "Dealer approval email sent to:",
                    dealer.email
                );

            } catch (emailError) {
                console.log(
                    "Dealer approval email failed:",
                    emailError
                );
            }
        }

        return res.json({
            message: dealer.approved
                ? "Dealer approved successfully"
                : "Dealer account blocked",
            dealer: dealer
        });

    } catch (error) {
        console.log("Update dealer error:", error);

        return res.status(500).json({
            message: "Failed to update dealer status"
        });
    }
});


// =====================================================
// ADMIN: Delete dealer
// =====================================================
router.delete("/:id", async function (req, res) {
    try {
        const dealer = await User.findByIdAndDelete(req.params.id);

        if (!dealer) {
            return res.status(404).json({
                message: "Dealer not found"
            });
        }

        // Delete orders belonging to this dealer
        await Order.deleteMany({
            dealerId: req.params.id
        });

        return res.json({
            message: "Dealer deleted successfully"
        });

    } catch (error) {
        console.log("Delete dealer error:", error);

        return res.status(500).json({
            message: "Failed to delete dealer"
        });
    }
});

module.exports = router;

