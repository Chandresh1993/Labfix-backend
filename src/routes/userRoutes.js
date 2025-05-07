import express from 'express';
import { deleteUser, getAllUser, getUSerByID, loginUser, signupUser, updateUser } from '../controllers/userController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// POST request for user signup
router.post('/signup', signupUser);
router.get('/', getAllUser)
router.get('/:id', verifyToken, getUSerByID);
router.patch('/:id', verifyToken, updateUser);
router.delete('/:id', verifyToken, deleteUser);

// POST request for user login
router.post('/login', loginUser);

export default router;
