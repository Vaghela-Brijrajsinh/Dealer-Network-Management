const express = require("express");
const Contact = require("../models/Contact");

const router = express.Router();

// ======================================================
// PUBLIC: Submit Contact Us Form
// ======================================================

router.post("/", async function (req, res) {
    try {
        const {
            name,
            email,
            phone,
            subject,
            message,
            //city,
        } = req.body;

        const cleanName = name
            ? String(name).trim()
            : "";

        const cleanEmail = email
            ? String(email).toLowerCase().trim()
            : "";

        const cleanPhone = phone
            ? String(phone).trim()
            : "";

        const cleanSubject = subject
            ? String(subject).trim()
            : "";

        const cleanMessage = message
            ? String(message).trim()
            : "";

        if (
            !cleanName ||
            !cleanEmail ||
            !cleanSubject ||
            !cleanMessage 
            //!city
        ) {
            return res.status(400).json({
                message:
                    "Name, email, subject, and message are required"
            });
        }

        // Name: alphabets and spaces only
        const namePattern = /^[A-Za-z\s]+$/;

        if (
            !namePattern.test(cleanName) ||
            cleanName.length < 2
        ) {
            return res.status(400).json({
                message:
                    "Name must contain alphabets and spaces only."
            });
        }

        // Email validation
        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(cleanEmail)) {
            return res.status(400).json({
                message:
                    "Please enter a valid email address."
            });
        }

        // Phone validation
        if (cleanPhone) {
            const phonePattern = /^[0-9]{10}$/;

            if (!phonePattern.test(cleanPhone)) {
                return res.status(400).json({
                    message:
                        "Phone number must contain exactly 10 digits."
                });
            }
        }

        const contact = new Contact({
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            subject: cleanSubject,
            message: cleanMessage,
            //city:city,
            status: "New"
        });

        await contact.save();

        res.status(201).json({
            message:
                "Thank you! Your message has been submitted successfully.",
            contact: contact
        });

    } catch (error) {

        console.log(
            "Submit contact error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to submit contact message"
        });
    }
});

// ======================================================
// ADMIN: Get all contacts
// ======================================================

router.get("/", async function (req, res) {
    try {

        const contacts = await Contact
            .find()
            .sort({ createdAt: -1 });

        res.json(contacts);

    } catch (error) {

        console.log(
            "Get contacts error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch contact messages"
        });
    }
});

// ======================================================
// GET single contact
// ======================================================

router.get("/:id", async function (req, res) {
    try {

        const contact = await Contact.findById(
            req.params.id
        );

        if (!contact) {
            return res.status(404).json({
                message:
                    "Contact message not found"
            });
        }

        res.json(contact);

    } catch (error) {

        console.log(
            "Get contact error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch contact details"
        });
    }
});

// ======================================================
// ADMIN: Update contact status
// New -> Read -> Resolved
// ======================================================

router.patch(
    "/:id/status",
    async function (req, res) {

        try {

            const { status } = req.body;

            if (!status) {
                return res.status(400).json({
                    message:
                        "Status is required"
                });
            }

            const contact =
                await Contact.findById(
                    req.params.id
                );

            if (!contact) {
                return res.status(404).json({
                    message:
                        "Contact message not found"
                });
            }

            contact.status = status;

            await contact.save();

            res.json({
                message:
                    "Contact message status updated to " +
                    status,
                contact: contact
            });

        } catch (error) {

            console.log(
                "Update contact status error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to update contact status"
            });
        }
    }
);

// ======================================================
// ADMIN: Delete contact
// ======================================================

router.delete("/:id", async function (req, res) {
    try {

        const contact =
            await Contact.findByIdAndDelete(
                req.params.id
            );

        if (!contact) {
            return res.status(404).json({
                message:
                    "Contact message not found"
            });
        }

        res.json({
            message:
                "Contact message deleted successfully"
        });

    } catch (error) {

        console.log(
            "Delete contact error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to delete contact message"
        });
    }
});

module.exports = router;