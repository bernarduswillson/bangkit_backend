import express from 'express';

// Controllers
import {
  register,
  login
} from '../controllers/authController';

const router = express.Router();

// Routes
router.post('/register', register);
router.post('/login', login);

export default router;