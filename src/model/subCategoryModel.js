import mongoose, { Schema } from "mongoose";

const category = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    mainCategoryId: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true
    }
},)



const subCategory = mongoose.model('subCategory', category)

export default subCategory;