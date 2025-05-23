import Product from "../model/productModel.js"
import { uploadImages } from '../config/multer.js';

import subCategory from "../model/subCategoryModel.js";
import fs from 'fs';
import path from 'path';
import SubCategory from '../model/subCategoryModel.js';


// Get Image URLs
const getImageUrls = (files) => {
    if (!files || files.length === 0) return [];
    return files.map(file => `/uploads/${file.filename}`);
};


// Create Product With Images
export const createProduct = (req, res) => {
    uploadImages(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: `Image Upload Error: ${err.message}` });
        }

        const {
            mainHeading,
            name,
            price,
            discountPrice,
            quantity,
            description,
            howToInstallAndTips,
            subCategoryID
        } = req.body;

        try {
            // --- Validate Required Fields ---
            if (!mainHeading || !name || !price || !quantity || !subCategoryID) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            // --- Check for Duplicate Product ---
            const existingProduct = await Product.findOne({ mainHeading });
            if (existingProduct) {
                return res.status(400).json({ message: "Product with this main heading already exists" });
            }

            // --- Fetch SubCategory and MainCategory ---
            const subCategory = await SubCategory.findById(subCategoryID)

            if (!subCategory) {
                return res.status(404).json({ message: "Subcategory not found" });
            }

            const mainCategory = subCategory.mainCategoryId?._id || null;

            // --- Create and Save New Product ---
            const newProduct = new Product({
                mainHeading,
                name,
                price,
                discountPrice,
                quantity,
                description,
                howToInstallAndTips,
                subCategoryID,
                mainCategory,
                images: getImageUrls(req.files),
            });

            const savedProduct = await newProduct.save();

            res.status(201).json(
                savedProduct
            );

        } catch (error) {
            console.error("Error while creating product:", error);
            res.status(500).json({ message: "Server error while creating product" });
        }
    });
};


export const getAllProduct = async (req, res) => {
    try {
        // --- Pagination Parameters ---
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;

        // --- Query Parameters ---
        const searchQuery = req.query.search || '';
        const subCategoryName = req.query.subCategoryName;
        const mainCategoryId = req.query.mainCategoryId;

        // --- Filter Construction ---
        const filter = {};

        // Apply search filter (case-insensitive match on 'name')
        if (searchQuery) {
            filter.$or = [
                { name: { $regex: searchQuery, $options: 'i' } },
                // You can extend this array to include other searchable fields
            ];
        }

        // Apply subcategory filter (case-insensitive match)
        if (subCategoryName) {
            const subCategory = await SubCategory.findOne({
                name: new RegExp(`^${subCategoryName}$`, 'i'),
            });

            if (!subCategory) {
                return res.status(200).json({
                    page,
                    limit,
                    total: 0,
                    totalPages: 0,
                    products: [],
                });
            }

            filter.subCategoryID = subCategory._id;
        }

        if (mainCategoryId) {
            filter.mainCategory = mainCategoryId;
        }

        // --- Query the Products ---
        const total = await Product.countDocuments(filter);

        const products = await Product.find(filter)
            .populate('subCategoryID', 'name')
            .populate('mainCategory', 'name')
            .skip(skip)
            .limit(limit);

        const hostURL = `${req.protocol}://${req.get('host')}`;

        // --- Format Image URLs ---
        const updatedProducts = products.map(product => ({
            ...product._doc,
            images: product.images.map(img =>
                img.startsWith('http') ? img : `${hostURL}${img}`
            ),
        }));

        // --- Send Response ---
        return res.status(200).json({
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            products: updatedProducts,
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({ message: 'Server Error' });
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
    uploadImages(req, res, async (err) => {
        if (err) return res.status(400).json({ message: err.message });

        try {
            const {
                mainHeading, name, price, discountPrice,
                quantity, description, howToInstallAndTips, subCategoryID
            } = req.body;


            const subCategory = await SubCategory.findById(subCategoryID)

            if (!subCategory) {
                return res.status(404).json({ message: "Subcategory not found" });
            }

            const mainCategory = subCategory.mainCategoryId?._id || null;

            const updatedFields = {
                mainHeading,
                name,
                price,
                discountPrice,
                quantity,
                description,
                howToInstallAndTips,
                subCategoryID,
                mainCategory,
            };

            // Only update images if new ones were uploaded
            if (req.files && req.files.length > 0) {
                const product = await Product.findById(req.params.id);

                // Delete old images if they exist
                if (product && product.images && product.images.length > 0) {
                    product.images.forEach(imagePath => {
                        const filename = imagePath.replace('/uploads/', '');
                        const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.error(`Failed to delete image file: ${filePath}`, err.message);
                            }
                        });
                    });
                }

                // Set new image paths
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
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // Delete associated image files
        if (product.images && product.images.length > 0) {
            product.images.forEach(imagePath => {
                const filename = imagePath.replace('/uploads/', '');
                const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error(`Failed to delete image file: ${filePath}`, err.message);
                    }
                });
            });
        }

        res.status(200).json({ message: "Product deleted", product });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};



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





