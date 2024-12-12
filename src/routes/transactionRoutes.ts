import { Router } from 'express';
import { upload } from '../config/multer';
import { authMiddleware } from '../middleware/authMiddleware';

// Controllers
import {
  ocrTransaction,
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTop5Products,
  omsetPrediction,
} from '../controllers/transactionController';

const router = Router();

// Routes
router.post('/', authMiddleware, createTransaction);
router.get('/', authMiddleware, getTransactions);
router.get('/predict/omset', authMiddleware, omsetPrediction);
router.get('/dashboard/top-5-products', authMiddleware, getTop5Products);
router.get('/:id', authMiddleware, getTransactionById);
router.put('/:id', authMiddleware, updateTransaction);
router.delete('/:id', authMiddleware, deleteTransaction);
router.post('/ocr', upload.single('image'), authMiddleware, ocrTransaction);

export default router;
