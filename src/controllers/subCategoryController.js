
import subCategory from "../model/subCategoryModel.js"


export const createSubCategory = async (req, res) => {
    const name = req.body.name?.toLowerCase(); // convert to lowercase
    const { mainCategoryId } = req.body;

    try {
        const existing = await subCategory.findOne({ name });
        if (existing) return res.status(400).json({ message: "Subcategory already exists" });

        const category = new subCategory({ name, mainCategoryId });
        const data = await category.save();

        const ChangeDta = {
            id: data._id,
            name: data.name,
            mainCategoryId: data.mainCategoryId,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        };

        res.status(201).json(ChangeDta);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};


export const getAllSubCategories = async (req, res) => {
    try {

        const subCategories = await subCategory.find().populate('mainCategoryId', 'name')
        res.status(200).json(subCategories)

    } catch (error) {
        res.status(500).json({ message: "Server Error" })

    }

}

export const getAllSubCategoriesById = async (req, res) => {


    try {

        const category = await subCategory.findById(req.params.id).populate('mainCategoryId', 'name');

        if (!category) return res.status(404).json({ message: "SubCategory is not found" })

        res.status(200).json(category)

    } catch (error) {
        res.status(500).json({ message: "Server Error" })

    }
}

export const updateCategory = async (req, res) => {



    try {

        const updateSubCategory = await subCategory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )

        if (!updateSubCategory) return res.status(404).json({ message: "SubCategory not found" })

        res.status(200).json(updateSubCategory)



    } catch (error) {
        res.status(500).json({ message: "server Error" })

    }

}



export const deletesubCategory = async (req, res) => {
    try {

        const deletesubCategory = await subCategory.findByIdAndDelete(req.params.id);
        if (!deletesubCategory) return res.status(404).json({ message: "SubCategory not found" })

        res.status(200).json({
            message: "subCategory Deletd",
            deletesubCategory
        })


    } catch (error) {
        res.status(500).json({ message: "server Error" })

    }

}