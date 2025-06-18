import express from "express";
import {
    createProduct,
    deleteProduct,
    getAllProduct,
    getProductById,
    getProductsBySubCategory,
    getRecentlyViewedProducts,
    updateProduct
} from "../controllers/productController.js";

const router = express.Router();

router.post("/", createProduct);
router.get('/', getAllProduct);

// ✅ Move static routes first
router.get('/products/:subCategoryID', getProductsBySubCategory);
router.get('/recently-viewed', getRecentlyViewedProducts);

// ✅ Keep dynamic route at the end
router.get('/:id', getProductById);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
