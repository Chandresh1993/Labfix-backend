import Category from "../model/mainCategoryModel.js";
import SubCategory from "../model/subCategoryModel.js";
import Product from "../model/productModel.js";

export const createCategory = async (req, res) => {

    const { name } = req.body;
    const { firstCategoryId } = req.body;

    const lowerCaseName = name.toLowerCase();



    try {

        const existing = await Category.findOne({ name: lowerCaseName });



        if (existing) return res.status(400).json({ message: "Category already exsits" });




        const category = new Category({ name: lowerCaseName, firstCategoryId });
        const data = await category.save();

        const ChangeDta = {
            id: data._id,
            name: data.name,
            firstCategoryId: data.firstCategoryId,
        };


        res.status(201).json(ChangeDta);

    } catch (error) {
        res.status(500).json({ message: "Server Error" })

    }

}


export const getAllCategories = async (req, res) => {
    try {

        const categories = await Category.find().populate("subCategories");
        res.status(200).json(categories)

    } catch (error) {
        res.status(500).json({ message: "Server Error" })

    }
}



export const getAllCategoriesById = async (req, res) => {

    try {

        const category = await Category.findById(req.params.id).populate("subCategories");

        if (!category) return res.status(404).json({ message: "Category is not  found" })

        res.status(200).json(category);

    } catch (error) {
        res.status(500).json({ message: "Server Error" })

    }

}

export const updateCategory = async (req, res) => {

    try {

        const updateCategory = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )

        if (!updateCategory) return res.status(404).json({ message: "Category not found" })

        res.status(200).json(updateCategory)

    } catch (error) {


        res.status(500).json({ message: "Server Error" })

    }

}





export const deletecategory = async (req, res) => {
    try {
        // Step 1: Delete the MainCategory
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Step 2: Find all SubCategories linked to this MainCategory
        const subCategories = await SubCategory.find({ mainCategoryId: deletedCategory._id });

        // Step 3: Get SubCategory IDs
        const subCategoryIds = subCategories.map(sc => sc._id);

        // Step 4: Delete Products linked to these SubCategories
        await Product.deleteMany({ subCategoryID: { $in: subCategoryIds } });

        // Step 5: Delete the SubCategories
        await SubCategory.deleteMany({ _id: { $in: subCategoryIds } });

        res.status(200).json({
            message: "Category and all linked SubCategories & Products deleted successfully",
            deletedCategory
        });

    } catch (error) {
        console.error("Delete Category Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
