import Product from "../model/productModel.js"
import { upload } from '../config/cloudinary.js'
import subCategory from "../model/subCategoryModel.js";
import SubCategory from '../model/subCategoryModel.js';
import { cloudinary } from '../config/cloudinary.js';





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

        try {
            // --- Validate Required Fields ---
            if (!mainHeading || !name || !price || !quantity || !subCategoryID || !year || !description) {
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



            const images = req.files.map(file => ({
                url: file.path,
                public_id: file.filename
            }));



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
                year,
                images
            });



            const savedProduct = await newProduct.save();

            res.status(201).json(
                savedProduct
            );

        } catch (error) {

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
                { year: { $regex: searchQuery, $options: 'i' } }
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
        if (err) return res.status(400).json({ message: err.message });

        try {
            const {
                mainHeading, name, price, discountPrice,
                quantity, description, howToInstallAndTips, subCategoryID, year
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
                year
            };

            if (req.files && req.files.length > 0) {
                const product = await Product.findById(req.params.id);

                // Delete old images from Cloudinary
                if (product && product.images && product.images.length > 0) {
                    for (const image of product.images) {
                        // Assume each image has { url, public_id }
                        if (image.public_id) {
                            try {
                                await cloudinary.uploader.destroy(image.public_id);
                            } catch (err) {
                                console.error("Error deleting from Cloudinary:", err.message);


                            }
                        }
                    }
                }


                // Upload new images to Cloudinary
                const uploadedImages = req.files.map(file => ({
                    url: file.path, // already a secure Cloudinary URL
                    public_id: file.filename // this is Cloudinary's public_id
                }));

                updatedFields.images = uploadedImages;

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





