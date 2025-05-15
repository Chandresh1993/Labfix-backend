import Product from "../model/productModel.js"
import { uploadImages } from '../config/multer.js';

import subCategory from "../model/subCategoryModel.js";


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
        const products = await Product.find().populate('subCategoryID', "name");

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
        const product = await Product.findById(req.params.id).populate("subCategoryID");

        if (!product) {
            return res.status(404).json({ message: "Product is not found" });
        }

        const host = req.protocol + '://' + req.get('host');

        const updatedProduct = {
            ...product._doc,
            images: product.images.map((img) => {
                if (img.startsWith('http')) {
                    return img;
                }
                return `${host}/uploads/${img.replace(/^\/uploads\//, '')}`;
            }),
        };

        res.status(200).json(updatedProduct);

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};



export const updateProduct = (req, res) => {

    console.log("Raw body (buffer):", req.body);

    uploadImages(req, res, async (err) => {
        if (err) return res.status(400).json({ message: err.message });

        try {
            const {
                mainHeading, name, price, discountPrice,
                quantity, description, howToInstallAndTips, subCategoryID
            } = req.body;

            const updatedFields = {
                mainHeading,
                name,
                price,
                discountPrice,
                quantity,
                description,
                howToInstallAndTips,
                subCategoryID,
            };

            // Only update images if new ones were uploaded
            if (req.files && req.files.length > 0) {
                updatedFields.images = req.files.map(file => `/uploads/${file.filename}`);
            }

            const updatedProduct = await Product.findByIdAndUpdate(
                req.params.id,
                updatedFields,
                { new: true, runValidators: true }
            );

            if (!updatedProduct) {
                return res.status(404).json({ message: "Product not found" });
            }

            res.status(200).json({ message: "Product updated", updatedProduct });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server Error" });
        }
    });
};


export const deleteProduct = async (req, res) => {

    try {

        const deleteProduct = await Product.findByIdAndDelete(req.params.id)
        if (!deleteProduct) return res.status(404).json({ message: "Product not found" })

        res.status(200).json({ message: " Product Deleted", deleteProduct })

    } catch (error) {
        res.status(500).json({ message: " server Error" })

    }

}



// Get all products by subcategory ID
export const getProductsBySubCategory = async (req, res) => {
    try {
        const subCategoryID = req.params.subCategoryID;

        const existingSubCategory = await subCategory.findById(subCategoryID);
        if (!existingSubCategory) {
            return res.status(404).json({ message: "Subcategory not found" });
        }


        const products = await Product.find({ subCategoryID }).populate("subCategoryID", "name")


        // Add full URL to each image
        const host = req.protocol + '://' + req.get('host');


        const productsWithFullImageUrls = products.map(product => {
            return {
                ...product._doc,
                images: product.images.map(img => {
                    // Check if the image already has a full URL (in case it's saved that way)
                    if (img.startsWith('http')) {
                        return img;
                    }
                    return `${host}/uploads/${img.replace(/^\/uploads\//, '')}`;
                }),
            };
        });

        res.status(200).json(productsWithFullImageUrls);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};





