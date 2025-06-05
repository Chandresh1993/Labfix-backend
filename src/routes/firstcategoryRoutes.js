import express from "express";
import { createFirstCategory, firstDeletecategory, firstGetAllCategories, firstGetAllCategoriesById, firstUpdateCategory } from "../controllers/fristCategoryController.js";



const router = express.Router();

router.post('/', createFirstCategory)
router.get('/', firstGetAllCategories)
router.get('/:id', firstGetAllCategoriesById)
router.patch('/:id', firstUpdateCategory)
router.delete('/:id', firstDeletecategory)

export default router;