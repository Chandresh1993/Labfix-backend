import mongoose from "mongoose";

const firstCategory = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }

})



const FirstCategory = mongoose.model('FirstCategory', firstCategory)

export default FirstCategory;