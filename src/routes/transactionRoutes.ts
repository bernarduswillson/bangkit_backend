import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';

// Controllers
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactionController';

const router = Router();

// Routes
router.post('/', authMiddleware, createTransaction);
router.get('/', authMiddleware, getTransactions);
router.get('/:id', authMiddleware, getTransactionById);
router.put('/:id', authMiddleware, updateTransaction);
router.delete('/:id', authMiddleware, deleteTransaction);

export default router;