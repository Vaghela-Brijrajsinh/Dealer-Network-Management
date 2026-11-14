const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const dealerRoutes = require("./routes/dealerRoutes");
const orderRoutes = require("./routes/orderRoutes");
const shipmentRoutes = require("./routes/shipmentRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const contactRoutes = require("./routes/contactRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());

app.use(express.json());

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);


// ===============================
// ROUTES
// ===============================

app.use("/api", authRoutes);

app.use("/api/products", productRoutes);

app.use("/api/dealers", dealerRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/shipments", shipmentRoutes);

app.use("/api/complaints", complaintRoutes);

app.use("/api/contacts", contactRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/payments", paymentRoutes);


// ===============================
// TEST ROUTE
// ===============================

app.get("/", function (req, res) {
    res.json({
        message: "Dealer Network Management API is running....."
    });
});


// ===============================
// MONGODB
// ===============================

mongoose.connect(process.env.MONGO_URI)
    .then(function () {

        console.log("Mongodb connected....");

        app.listen(
            process.env.PORT || 5000,
            function () {

                console.log(
                    "Server running on port " +
                    (process.env.PORT || 5000)
                );

            }
        );

    })
    .catch(function (error) {

        console.log(
            "MongoDB connection error:",
            error
        );

    });