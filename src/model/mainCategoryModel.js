import mongoose, { Schema } from "mongoose";

const mainCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    firstCategoryId: {
        type: Schema.Types.ObjectId,
        ref: "FirstCategory",
        required: true
    }
})

mainCategorySchema.virtual("subCategories", {
    ref: "subCategory",
    localField: "_id",
    foreignField: "mainCategoryId",
});

mainCategorySchema.set("toObject", { virtuals: true });
mainCategorySchema.set("toJSON", { virtuals: true });

const Category = mongoose.model('Category', mainCategorySchema)

export default Category;