
const express = require("express");
const Category = require("../models/Category");
const Product = require("../models/Product");

const router = express.Router();

/* =========================================================
   GET ALL CATEGORIES
========================================================= */

router.get("/", async function (req, res) {
    try {
        const categories = await Category.find().sort({
            createdAt: 1
        });

        res.json(categories);
    } catch (error) {
        console.log("Fetch categories error:", error);

        res.status(500).json({
            message: "Failed to fetch categories"
        });
    }
});


/* =========================================================
   ADD MAIN CATEGORY
========================================================= */

router.post("/", async function (req, res) {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const cleanName = name.trim();

        const existingCategory = await Category.findOne({
            name: {
                $regex: new RegExp(
                    "^" + cleanName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
                    "i"
                )
            }
        });

        if (existingCategory) {
            return res.status(400).json({
                message: "Category already exists"
            });
        }

        const category = new Category({
            name: cleanName,
            subcategories: []
        });

        await category.save();

        res.status(201).json({
            message: "Category created successfully",
            category
        });

    } catch (error) {
        console.log("Create category error:", error);

        res.status(500).json({
            message: "Failed to create category"
        });
    }
});


/* =========================================================
   EDIT MAIN CATEGORY
========================================================= */

router.put("/:id", async function (req, res) {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const cleanName = name.trim();

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        const duplicateCategory = await Category.findOne({
            _id: {
                $ne: category._id
            },
            name: {
                $regex: new RegExp(
                    "^" + cleanName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
                    "i"
                )
            }
        });

        if (duplicateCategory) {
            return res.status(400).json({
                message: "Category already exists"
            });
        }

        const oldCategoryName = category.name;

        category.name = cleanName;

        await category.save();

        /*
            Update all products that use the old
            main category name.
        */

        await Product.updateMany(
            {
                category: oldCategoryName
            },
            {
                $set: {
                    category: cleanName
                }
            }
        );

        res.json({
            message: "Category updated successfully",
            category
        });

    } catch (error) {
        console.log("Update category error:", error);

        res.status(500).json({
            message: "Failed to update category"
        });
    }
});


/* =========================================================
   ADD SUBCATEGORY
========================================================= */

router.post("/:id/subcategories", async function (req, res) {
    try {
        const { name, subTypes } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Subcategory name is required"
            });
        }

        const cleanName = name.trim();

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        const duplicateSub = category.subcategories.find(
            function (sub) {
                return (
                    sub.name.toLowerCase() ===
                    cleanName.toLowerCase()
                );
            }
        );

        if (duplicateSub) {
            return res.status(400).json({
                message:
                    "Subcategory already exists under this category"
            });
        }

        const formattedSubTypes = Array.isArray(subTypes)
            ? subTypes
                .map(function (type) {
                    return String(type).trim();
                })
                .filter(Boolean)
            : [];

        category.subcategories.push({
            name: cleanName,
            subTypes: formattedSubTypes
        });

        await category.save();

        res.status(201).json({
            message: "Subcategory added successfully",
            category
        });

    } catch (error) {
        console.log("Add subcategory error:", error);

        res.status(500).json({
            message: "Failed to add subcategory"
        });
    }
});


/* =========================================================
   EDIT SUBCATEGORY
========================================================= */

router.put(
    "/:categoryId/subcategories/:subcategoryId",
    async function (req, res) {
        try {
            const {
                categoryId,
                subcategoryId
            } = req.params;

            const {
                name,
                subTypes
            } = req.body;

            if (!name || !name.trim()) {
                return res.status(400).json({
                    message: "Subcategory name is required"
                });
            }

            const cleanName = name.trim();

            const category = await Category.findById(
                categoryId
            );

            if (!category) {
                return res.status(404).json({
                    message: "Category not found"
                });
            }

            const subcategory =
                category.subcategories.id(subcategoryId);

            if (!subcategory) {
                return res.status(404).json({
                    message: "Subcategory not found"
                });
            }

            const duplicateSub =
                category.subcategories.find(
                    function (sub) {
                        return (
                            sub._id.toString() !==
                                subcategoryId &&
                            sub.name.toLowerCase() ===
                                cleanName.toLowerCase()
                        );
                    }
                );

            if (duplicateSub) {
                return res.status(400).json({
                    message:
                        "Another subcategory with this name already exists"
                });
            }

            const oldSubcategoryName =
                subcategory.name;

            subcategory.name = cleanName;

            if (Array.isArray(subTypes)) {
                subcategory.subTypes =
                    subTypes
                        .map(function (type) {
                            return String(type).trim();
                        })
                        .filter(Boolean);
            }

            await category.save();

            /*
                Update products which use the old
                subcategory name.
            */

            await Product.updateMany(
                {
                    category: category.name,
                    subcategory: oldSubcategoryName
                },
                {
                    $set: {
                        subcategory: cleanName
                    }
                }
            );

            res.json({
                message:
                    "Subcategory updated successfully",
                category
            });

        } catch (error) {
            console.log(
                "Update subcategory error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to update subcategory"
            });
        }
    }
);


/* =========================================================
   DELETE SUBCATEGORY
========================================================= */

router.delete(
    "/:categoryId/subcategories/:subcategoryId",
    async function (req, res) {
        try {
            const {
                categoryId,
                subcategoryId
            } = req.params;

            const category = await Category.findById(
                categoryId
            );

            if (!category) {
                return res.status(404).json({
                    message: "Category not found"
                });
            }

            const subcategory =
                category.subcategories.id(
                    subcategoryId
                );

            if (!subcategory) {
                return res.status(404).json({
                    message: "Subcategory not found"
                });
            }

            /*
                Do not allow deleting a subcategory
                that is already used by products.
            */

            const productCount =
                await Product.countDocuments({
                    category: category.name,
                    subcategory: subcategory.name
                });

            if (productCount > 0) {
                return res.status(400).json({
                    message:
                        `Cannot delete subcategory '${subcategory.name}'. ` +
                        `It is currently used by ${productCount} product(s).`
                });
            }

            category.subcategories.pull(
                subcategoryId
            );

            await category.save();

            res.json({
                message:
                    "Subcategory deleted successfully",
                category
            });

        } catch (error) {
            console.log(
                "Delete subcategory error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to delete subcategory"
            });
        }
    }
);


/* =========================================================
   DELETE MAIN CATEGORY
========================================================= */

router.delete("/:id", async function (req, res) {
    try {
        const category = await Category.findById(
            req.params.id
        );

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        /*
            Do not allow deleting a main category
            if products are using it.
        */

        const productCount =
            await Product.countDocuments({
                category: category.name
            });

        if (productCount > 0) {
            return res.status(400).json({
                message:
                    `Cannot delete category '${category.name}'. ` +
                    `It is currently used by ${productCount} product(s).`
            });
        }

        await Category.findByIdAndDelete(
            req.params.id
        );

        res.json({
            message:
                "Category deleted successfully"
        });

    } catch (error) {
        console.log(
            "Delete main category error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to delete category"
        });
    }
});


module.exports = router;

