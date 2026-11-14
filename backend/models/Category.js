const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        subTypes: {
            type: [String],
            default: []
        }
    }
);


const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        subcategories: {
            type: [subcategorySchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);


module.exports =
    mongoose.model(
        "Category",
        categorySchema
    );