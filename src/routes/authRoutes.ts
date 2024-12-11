import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';

// Controllers
import {
  register,
  login,
  loginGoogle,
  getUser,
  updateUser,
} from '../controllers/authController';

const router = express.Router();

// Routes
router.post('/register', register);
router.post('/login', login);
router.post('/login/google', loginGoogle);
router.get('/user', authMiddleware, getUser);
router.put('/user', authMiddleware, updateUser);

export default router;