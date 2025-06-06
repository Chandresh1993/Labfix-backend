import FirstCategory from "../model/FristCategory.js";
import Category from '../model/mainCategoryModel.js'; // MainCategory model
import subCategory from '../model/subCategoryModel.js'; // SubCategory model


export const createFirstCategory = async (req, res) => {

    const { name } = req.body;

    const lowerCaseName = name.toLowerCase();



    try {

        const existing = await FirstCategory.findOne({ name: lowerCaseName });



        if (existing) return res.status(400).json({ message: "First Category already exsits" });


        const category = new FirstCategory({ name: lowerCaseName });
        await category.save();


        res.status(201).json({ message: "First Category created", category });

    } catch (error) {
        res.status(500).json({ message: "Server Error" })

    }

}

export const firstGetAllCategories = async (req, res) => {
    try {
        const firstCategories = await FirstCategory.find().lean();

        const result = await Promise.all(
            firstCategories.map(async (fc) => {
                const mainCategories = await Category.find({ firstCategoryId: fc._id })
                    .populate({
                        path: 'subCategories',
                        model: 'subCategory'
                    })
                    .lean();

                return {
                    ...fc,
                    mainCategories
                };
            })
        );

        res.status(200).json(result);
    } catch (error) {
        console.error("Fetch error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const firstGetAllCategoriesById = async (req, res) => {

    try {
        const { id } = req.params;

        const firstCategory = await FirstCategory.findById(id).lean();

        if (!firstCategory) {
            return res.status(404).json({ message: "First category not found" });
        }

        const mainCategories = await Category.find({ firstCategoryId: id })
            .populate({
                path: 'subCategories',
                model: 'subCategory'
            })
            .lean();

        const result = {
            ...firstCategory,
            mainCategories
        };

        res.status(200).json(result);

    } catch (error) {
        console.error("Fetch by ID error:", error);
        res.status(500).json({ message: "Server Error" })

    }

}


export const firstUpdateCategory = async (req, res) => {

    try {

        const updateCategory = await FirstCategory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )

        if (!updateCategory) return res.status(404).json({ message: "First Category not found" })

        res.status(200).json(updateCategory)

    } catch (error) {


        res.status(500).json({ message: "Server Error" })

    }

}

export const firstDeletecategory = async (req, res) => {
    try {

        const deletedCategory = await FirstCategory.findByIdAndDelete(req.params.id);
        if (!deletedCategory) return res.status(404).json({ message: " first Category not found" });

        res.status(200).json({
            message: "first Category deleted",
            deletedCategory
        })

    } catch (error) {
        res.status(500).json({ message: "Server Error" })

    }

}