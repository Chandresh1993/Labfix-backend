import Product from "../model/productModel.js"
import { uploadImages } from '../config/multer.js';


// Get Image URLs
const getImageUrls = (files) => {
    if (!files || files.length === 0) return [];
    return files.map(file => `/uploads/${file.filename}`);
};


// Create Product With Images
export const createProduct = (req, res) => {
    uploadImages(req, res, async (err) => {
        if (err) return res.status(400).json({ message: err.message });

        const {
            mainHeading, name, price, discountPrice,
            quantity, description, howToInstallAndTips, subCategoryID
        } = req.body;

        try {
            const existingProduct = await Product.findOne({ mainHeading });
            if (existingProduct) return res.status(400).json({ message: "MainHeading already exists" });

            const newProduct = new Product({
                mainHeading,
                name,
                price,
                discountPrice,
                quantity,
                description,
                howToInstallAndTips,
                subCategoryID,
                images: getImageUrls(req.files)
            });

            const savedProduct = await newProduct.save();
            res.status(201).json({ message: "Product created successfully", product: savedProduct });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error while creating product" });
        }
    });
};

export const getAllProduct = async (req, res) => {
    try {
        const products = await Product.find().populate('subCategoryID');

        // Add full URL to each image
        const host = req.protocol + '://' + req.get('host');
        const updatedProducts = products.map(product => {

            return {
                ...product._doc,
                images: product.images.map(img => `${host}${img}`),
            };
        });

        res.status(200).json(updatedProducts);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


export const getProductById = async (req, res) => {


    try {

        const product = await Product.findById(req.params.id).populate("subCategoryID")

        if (!product) return res.status(404).json({ message: "Product is not found" })

        res.status(200).json({ product })

    } catch (error) {
        res.status(500).json({ message: " Server Error" })

    }

}


export const updateProduct = async (req, res) => {
    try {

        const updateProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )

        if (!updateProduct) return res.status(404).json({ message: "Product not found", updateProduct })
        res.status(200).json({ message: "Product updated", updateProduct });



    } catch (error) {
        res.status(500).json({ message: "server Error" })

    }
}


export const deleteProduct = async (req, res) => {

    try {

        const deleteProduct = await Product.findByIdAndDelete(req.params.id)
        if (!deleteProduct) return res.status(404).json({ message: "Product not found" })

        res.status(200).json({ message: " Product Deleted", deleteProduct })

    } catch (error) {
        res.status(500).json({ message: " server Error" })

    }

}


export const testing = async (req, res) => {

    console.log("tesing")

}

