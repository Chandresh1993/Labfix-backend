import express from "express"
import { createCategory, deletecategory, getAllCategories, getAllCategoriesById, updateCategory } from "../controllers/categoryController.js";


const router = express.Router();

router.post('/', createCategory)
router.get('/', getAllCategories)
router.get('/:id', getAllCategoriesById)
router.patch('/:id', updateCategory)
router.delete('/:id', deletecategory)

export default router;
