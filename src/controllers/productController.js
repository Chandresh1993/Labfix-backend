import Product from "../model/productModel.js"
import { upload } from '../config/cloudinary.js'
import subCategory from "../model/subCategoryModel.js";
import SubCategory from '../model/subCategoryModel.js';
import { cloudinary } from '../config/cloudinary.js';
import { error } from "console";
import Category from "../model/mainCategoryModel.js";





// Create Product With Images
export const createProduct = (req, res) => {
    upload.array('images')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        }

        const {
            mainHeading,
            name,
            price,
            discountPrice,
            quantity,
            description,
            howToInstallAndTips,
            subCategoryID,
            year
        } = req.body;

        // --- Quick Validation (Synchronous) ---
        if (!mainHeading || !name || !price || !quantity || !subCategoryID || !year || !description) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        try {
            // --- Parallel Fetch: Product & SubCategory ---
            const [existingProduct, subCategory] = await Promise.all([
                Product.findOne({ mainHeading }),
                SubCategory.findById(subCategoryID)
            ]);

            if (existingProduct) {
                return res.status(400).json({ message: "Product with this main heading already exists" });
            }

            if (!subCategory) {
                return res.status(404).json({ message: "Subcategory not found" });
            }

            const mainCategory = subCategory.mainCategoryId?._id || subCategory.mainCategoryId || null;

            if (!mainCategory) {
                return res.status(400).json({ message: "Main category not found in subcategory" });
            }

            // --- Fetch Category ---
            const categoryData = await Category.findById(mainCategory);
            if (!categoryData) {
                return res.status(404).json({ message: "Main category not found in category collection" });
            }

            const FirstCategory = categoryData.firstCategoryId || null;
            if (!FirstCategory) {
                return res.status(404).json({ message: "First category not found in category" });
            }

            // --- Process Images ---
            const images = req.files.map(file => ({
                url: file.path,
                public_id: file.filename
            }));

            // --- Create and Save Product ---
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
                FirstCategory,
                year,
                images
            });

            const savedProduct = await newProduct.save();
            return res.status(201).json(savedProduct);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server error while creating product" });
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
        const subCategoryId = req.query.subCategoryId;
        const mainCategoryId = req.query.mainCategoryId;
        const productId = req.query.productId;
        const firstCategoryId = req.query.firstCategoryId;


        // --- Filter Construction ---
        const filter = {};

        // Apply search filter (case-insensitive match on 'name')
        if (searchQuery) {
            filter.$or = [
                { name: { $regex: searchQuery, $options: 'i' } },
                { year: { $regex: searchQuery, $options: 'i' } }
                // You can extend this array to include other searchable fields
            ];
        }

        // Apply subcategory filter (case-insensitive match)
        if (subCategoryId) {
            const subCategory = await SubCategory.findById(subCategoryId);

            if (!subCategory) {
                return res.status(404).json({ message: "subCategory not found" })


            }
            filter.subCategoryID = subCategory._id;
        }

        if (mainCategoryId) {
            filter.mainCategory = mainCategoryId;
        }

        // Apply first category filter ✅
        if (firstCategoryId) {
            filter.FirstCategory = firstCategoryId;
        }

        if (productId) {

            const productIdFind = await Product.findById(productId)
            if (!productIdFind) {
                return res.status(404).json({ message: "product not found" })
            }
            filter._id = productIdFind._id

        }

        // --- Query the Products ---
        const total = await Product.countDocuments(filter);

        const products = await Product.find(filter)
            .populate('subCategoryID', 'name')
            .populate('mainCategory', 'name')
            .populate('FirstCategory', 'name')
            .skip(skip)
            .sort({ createdAt: -1 })
            .limit(limit);


        const updatedProducts = products.map(product => ({
            ...product._doc,
            images: Array.isArray(product.images)
                ? product.images
                    .filter(img => img?.url) // remove images with missing url
                    .map(img => ({
                        url: img.url,
                        public_id: img.public_id || null
                    }))
                : []
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
        const product = await Product.findById(req.params.id)
            .populate("subCategoryID", "name")
            .populate("mainCategory", "name");


        if (!product) {
            return res.status(404).json({ message: "Product is not found" });
        }



        res.status(200).json(product);

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};



export const updateProduct = (req, res) => {
    upload.array('images')(req, res, async (err) => {
        if (err) return res.status(400).json({ message: `Upload error: ${err.message}` });

        try {
            const {
                mainHeading,
                name,
                price,
                discountPrice,
                quantity,
                description,
                howToInstallAndTips,
                subCategoryID,
                year
            } = req.body;

            // Validate required fields
            if (!mainHeading || !name || !price || !quantity || !subCategoryID || !year || !description) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            // Find SubCategory and validate
            const subCategory = await SubCategory.findById(subCategoryID);
            if (!subCategory) {
                return res.status(404).json({ message: "Subcategory not found" });
            }

            // Get Main Category ID
            const mainCategory = subCategory.mainCategoryId?._id || subCategory.mainCategoryId || null;
            if (!mainCategory) {
                return res.status(400).json({ message: "Main category not found in subcategory" });
            }

            // Get First Category ID
            const categoryData = await Category.findById(mainCategory);
            if (!categoryData || !categoryData.firstCategoryId) {
                return res.status(400).json({ message: "First category not found in main category" });
            }
            const FirstCategory = categoryData.firstCategoryId;

            // Prepare updated fields
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
                FirstCategory,
                year
            };

            // If new images are uploaded, delete old ones
            if (req.files && req.files.length > 0) {
                const existingProduct = await Product.findById(req.params.id);
                if (existingProduct && existingProduct.images && existingProduct.images.length > 0) {
                    for (const image of existingProduct.images) {
                        if (image.public_id) {
                            try {
                                await cloudinary.uploader.destroy(image.public_id);
                            } catch (err) {
                                console.error("Cloudinary delete error:", err.message);
                            }
                        }
                    }
                }

                // Prepare new image data
                const newImages = req.files.map(file => ({
                    url: file.path,
                    public_id: file.filename
                }));

                updatedFields.images = newImages;
            }

            // Update the product
            const updatedProduct = await Product.findByIdAndUpdate(
                req.params.id,
                updatedFields,
                { new: true, runValidators: true }
            );

            if (!updatedProduct) {
                return res.status(404).json({ message: "Product not found" });
            }

            res.status(200).json({ message: "Product updated successfully", updatedProduct });

        } catch (error) {
            console.error("Update Error:", error);
            res.status(500).json({ message: "Server Error while updating product" });
        }
    });
};




export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // Delete images from Cloudinary
        if (Array.isArray(product.images)) {
            for (const img of product.images) {

                if (img?.public_id) {
                    try {
                        const result = await cloudinary.uploader.destroy(img.public_id, {
                            resource_type: 'image',
                            invalidate: true
                        });

                    } catch (err) {
                        console.error(`Failed to delete image ${img.public_id}:`, err.message);
                    }
                }
            }

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


        const products = await Product.find({ subCategoryID })
            .populate("subCategoryID", "name")
            .populate("mainCategory", "name");


        // Format images: keep only valid URLs, no local path fallback as images are from Cloudinary
        const updatedProducts = products.map(product => ({
            ...product._doc,
            images: Array.isArray(product.images)
                ? product.images
                    .filter(img => img?.url) // remove images without url
                    .map(img => ({
                        url: img.url, // assuming Cloudinary URLs are full URLs
                        public_id: img.public_id || null,
                    }))
                : []
        }));

        res.status(200).json(updatedProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};





