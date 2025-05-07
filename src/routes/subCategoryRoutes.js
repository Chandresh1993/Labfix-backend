import express from "express"
import { createSubCategory, deletesubCategory, getAllSubCategories, getAllSubCategoriesById, updateCategory } from "../controllers/subCategoryController.js";


const router = express.Router();

router.post('/', createSubCategory)
router.get('/', getAllSubCategories)
router.get('/:id', getAllSubCategoriesById)
router.patch('/:id', updateCategory)
router.delete('/:id', deletesubCategory)

export default router;
