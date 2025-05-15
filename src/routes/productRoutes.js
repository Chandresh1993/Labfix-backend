import express from "express";
import { createProduct, deleteProduct, getAllProduct, getProductById, getProductsBySubCategory, updateProduct } from "../controllers/productController.js";

const router = express.Router()

router.post("/", createProduct)
router.get('/', getAllProduct)
router.get('/:id', getProductById);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.get('/products/:subCategoryID', getProductsBySubCategory);


export default router;