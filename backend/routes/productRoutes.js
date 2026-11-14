const express = require("express");
const multer = require("multer");
const path = require("path");
const Product = require("../models/Product");
const User = require("../models/User");
const { sendProductAddedEmail } = require("../utils/sendOTP");

const router = express.Router();


// Image upload storage configuration

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: function (req, file, cb) {
        cb(
            null,
            Date.now() + path.extname(file.originalname)
        );
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});


//for entire list
router.get("/", async function (req, res) {
    try {
        const products = await Product.find()
            .sort({ createdAt: -1 });

        res.json(products);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to fetch products"
        });
    }
});


// for pagination page wise
router.get("/dealer", async function (req, res) {
    try {
        const page = Number(req.query.page) || 1; 

        const limit = 4;

        const skip = (page - 1) * limit; 

        const products = await Product.find({
            status: { $ne: "Inactive" }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        const totalProducts = await Product.countDocuments({
            status: { $ne: "Inactive" }
        });

        const totalPages = Math.ceil(
            totalProducts / limit
        );

        res.json({
            products: products,
            currentPage: page,
            totalPages: totalPages,
            totalProducts: totalProducts
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to fetch dealer products"
        });
    }
});





// validations
function validateProductData(body) {
    const name = body.name
        ? body.name.trim()
        : "";

    const category = body.category
        ? body.category.trim()
        : "";

    const subcategory = body.subcategory
        ? body.subcategory.trim()
        : "";

    const productType = body.productType
        ? body.productType.trim()
        : "";

    const price = Number(body.price);

    const stock = Number(body.stock);

    const description = body.description
        ? body.description.trim()
        : "";


    // Product name validation
    if (!name || name.length < 2) {
        return "Product name is required and must be at least 2 characters long.";
    }


    // Check if name contains only symbols
    if (!/[a-zA-Z0-9]/.test(name)) {
        return "Product name cannot contain only symbols.";
    }


    // Category validation
    if (!category) {
        return "Category is required.";
    }


    // Subcategory validation
    if (!subcategory) {
        return "Subcategory is required.";
    }


    // Price validation
    if (isNaN(price) || price <= 0) {
        return "Price must be a valid positive number greater than 0.";
    }


    // Stock validation
    if (
        isNaN(stock) ||
        stock < 0 ||
        !Number.isInteger(stock)
    ) {
        return "Stock quantity must be a whole number 0 or greater.";
    }


    // Description validation
    if (!description) {
        return "Description is required.";
    }


    return null;
}


// ============================================================
// ADD PRODUCT
// ADMIN ONLY
// URL: POST /api/products
// ============================================================

router.post(
    "/",
    upload.single("image"),
    async function (req, res) {
        try {

            // ----------------------------------------------------
            // Validate product data
            // ----------------------------------------------------

            const errorMsg =
                validateProductData(req.body);

            if (errorMsg) {
                return res.status(400).json({
                    message: errorMsg
                });
            }


            // ----------------------------------------------------
            // Image is required
            // ----------------------------------------------------

            if (!req.file) {
                return res.status(400).json({
                    message: "Product image is required."
                });
            }


            // ----------------------------------------------------
            // Create product
            // ----------------------------------------------------

            const product = new Product({
                name: req.body.name.trim(),

                category: req.body.category.trim(),

                subcategory:
                    req.body.subcategory
                        ? req.body.subcategory.trim()
                        : "",

                productType:
                    req.body.productType
                        ? req.body.productType.trim()
                        : "",

                price: Number(req.body.price),

                stock: Number(req.body.stock),

                description:
                    req.body.description.trim(),

                image:
                    req.file
                        ? req.file.filename
                        : "",

                status:
                    req.body.status || "Active"
            });


            // ----------------------------------------------------
            // Save product
            // ----------------------------------------------------

            const savedProduct =
                await product.save();


            // ----------------------------------------------------
            // Notify all dealers by email
            // ----------------------------------------------------

            try {

                const dealers =
                    await User.find({
                        role: "dealer"
                    }).select("email");


                for (const dealer of dealers) {

                    if (dealer.email) {

                        sendProductAddedEmail(
                            dealer.email,
                            savedProduct
                        );

                    }

                }

            } catch (emailErr) {

                console.log(
                    "Error sending product emails to dealers:",
                    emailErr.message
                );

            }


            // ----------------------------------------------------
            // Success response
            // ----------------------------------------------------

            res.status(201).json({
                message: "Product added successfully",
                product: savedProduct
            });

        } catch (error) {

            console.log(
                "Add product error:",
                error
            );

            res.status(500).json({
                message: "Failed to add product"
            });
        }
    }
);


// ============================================================
// UPDATE PRODUCT
// ADMIN ONLY
// URL: PUT /api/products/:id
// ============================================================

router.put(
    "/:id",
    upload.single("image"),
    async function (req, res) {
        try {

            // ----------------------------------------------------
            // Validate product data
            // ----------------------------------------------------

            const errorMsg =
                validateProductData(req.body);

            if (errorMsg) {
                return res.status(400).json({
                    message: errorMsg
                });
            }


            // ----------------------------------------------------
            // Product update data
            // ----------------------------------------------------

            const data = {

                name: req.body.name.trim(),

                category:
                    req.body.category.trim(),

                subcategory:
                    req.body.subcategory
                        ? req.body.subcategory.trim()
                        : "",

                productType:
                    req.body.productType
                        ? req.body.productType.trim()
                        : "",

                price:
                    Number(req.body.price),

                stock:
                    Number(req.body.stock),

                description:
                    req.body.description.trim(),

                status:
                    req.body.status || "Active"
            };


            // ----------------------------------------------------
            // Update image only if new image uploaded
            // ----------------------------------------------------

            if (req.file) {
                data.image = req.file.filename;
            }


            // ----------------------------------------------------
            // Update product
            // ----------------------------------------------------

            const product =
                await Product.findByIdAndUpdate(
                    req.params.id,
                    data,
                    {
                        returnDocument: "after",
                        runValidators: true
                    }
                );


            // ----------------------------------------------------
            // Product not found
            // ----------------------------------------------------

            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }


            // ----------------------------------------------------
            // Success response
            // ----------------------------------------------------

            res.json({
                message: "Product updated successfully",
                product: product
            });

        } catch (error) {

            console.log(
                "Update product error:",
                error
            );

            res.status(500).json({
                message: "Failed to update product"
            });
        }
    }
);


// ============================================================
// DELETE PRODUCT
// ADMIN ONLY
// URL: DELETE /api/products/:id
// ============================================================

router.delete(
    "/:id",
    async function (req, res) {
        try {

            const product =
                await Product.findByIdAndDelete(
                    req.params.id
                );


            // ----------------------------------------------------
            // Product not found
            // ----------------------------------------------------

            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }


            // ----------------------------------------------------
            // Success response
            // ----------------------------------------------------

            res.json({
                message: "Product deleted successfully"
            });

        } catch (error) {

            console.log(
                "Delete product error:",
                error
            );

            res.status(500).json({
                message: "Failed to delete product"
            });
        }
    }
);


// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;