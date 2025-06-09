import mongoose, { Schema } from "mongoose";

const productSchema = new mongoose.Schema({

    mainHeading: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    name: {
        type: String,
        required: true,
        trim: true

    },
    price: {
        type: Number,
        required: true,
        trim: true

    },
    discountPrice: {
        type: Number,
        trim: true

    },
    quantity: {
        type: Number,
        required: true,
        trim: true
    },

    description: {
        type: String,
        trim: true
    },
    howToInstallAndTips: {
        type: String,
        trim: true
    },
    year: {
        type: String,
        trim: true
    },

    images: [
        {
            url: {
                type: String,
                required: true
            },
            public_id: {
                type: String,
                required: true
            }
        }
    ],
    subCategoryID: {
        type: Schema.Types.ObjectId,
        ref: "subCategory",
        required: true
    },
    mainCategory: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true

    },
    FirstCategory: {
        type: Schema.Types.ObjectId,
        ref: "FirstCategory",
        required: true
    },





}, { timestamps: true })

const Product = mongoose.model("Product", productSchema)

export default Product;