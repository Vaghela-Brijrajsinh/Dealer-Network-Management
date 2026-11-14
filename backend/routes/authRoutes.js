
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// ==================== REGISTER ====================
router.post("/register", async (req, res) => {
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
      gstNumber,
    } = req.body;

    // clean email and phone number after enters
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPhone = String(phone || "").trim();

    // Check required fields
    if (
      !name ||
      !cleanEmail ||
      !password ||
      !confirmPassword ||
      !cleanPhone
    ) {
      return res.status(400).json({
        message: "Please fill in all required fields",
      });
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    // Validate phone number: exactly 10 digits
    if (!/^\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        message: "Phone number must contain exactly 10 digits",
      });
    }

    // Validate pincode if provided
    if (pincode && !/^\d{6}$/.test(String(pincode).trim())) {
      return res.status(400).json({
        message: "Pincode must contain exactly 6 digits",
      });
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // Check whether email is already registered
    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is registered",
      });
    }

    // phone num check exists or not 
    const existingPhone = await User.findOne({
      phone: cleanPhone,
    });

    if (existingPhone) {
      return res.status(409).json({
        message: "This phone number is registered",
      });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = new User({
      name,
      email: cleanEmail,
      password: hashedPassword,
      district,
      taluka,
      city,
      pincode,
      shopName,
      phone: cleanPhone,
      address,
      gstNumber,
    });

    // Save user to MongoDB
    await newUser.save();

    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    // handle 11000 duplicate key error for email or phone
    if (error.code === 11000) {
      if (error.keyPattern?.phone) {
        return res.status(409).json({
          message: "This phone number is registered",
        });
      }

      if (error.keyPattern?.email) {
        return res.status(409).json({
          message: "This email is registered",
        });
      }

      return res.status(409).json({
        message: "This information is already registered",
      });
    }

    return res.status(500).json({
      message: "Registration failed",
    });
  }
});

// ==================== LOGIN ====================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = String(email || "").trim().toLowerCase();

    // Validate required fields
    if (!cleanEmail || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    // Find user by email
    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Return user details
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Login failed",
    });
  }
});

module.exports = router;

