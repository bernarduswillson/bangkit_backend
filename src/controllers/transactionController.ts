import { Request, Response } from 'express';
import { firestore } from '../config/firestore';
import axios from 'axios';
import process from 'process';

interface MulterRequest extends Request {
  // eslint-disable-next-line no-undef
  file?: Express.Multer.File;
}

// Model
import { Transaction } from '../models/transaction';


// OCR transaction
export const ocrTransaction = async (req: MulterRequest, res: Response) => {
  const { user_id } = req.body;
  const image = req.file;

  if (!user_id || !image) {
    res.status(400).json({
      status: 'error',
      message: 'user_id and image are required.',
    });
  }

  try {
    const imageBuffer = image?.buffer;

    const formData = new FormData();
    formData.append('user_id', user_id);
    if (imageBuffer) {
      const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
      formData.append('image', blob, image.originalname);
    } else {
      throw new Error('Image buffer is undefined');
    }

    // Send image to OCR API
    const response = await axios.post(
      `${process.env.OCR_API_URL}/api/v1/receipt/inference`,
      formData
    );

    res.status(200).json({
      status: response.data.status,
      message: response.data.message,
      data: response.data.data,
    });
  } catch (error) {
    console.error('Error in OCR transaction:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process OCR transaction.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};


// Create a transaction
export const createTransaction = async (req: Request, res: Response) => {
  const transaction: Omit<Transaction, 'transaction_id'> = req.body;

  // Validate required fields
  if (!transaction.user_id || !transaction.items) {
    res.status(400).json({
      status: "error",
      message: "Missing required fields: user_id or items."
    });
  }

  try {
    // Generate a new transaction ID
    const transactionsRef = firestore.collection('transactions');
    const lastTransactionSnapshot = await transactionsRef.orderBy('timestamp', 'desc').limit(1).get();
    const newTransactionId = lastTransactionSnapshot.empty ? 'txn_1' : `txn_${parseInt(lastTransactionSnapshot.docs[0].id.split('_')[1]) + 1}`;

    const newTransaction: Transaction = {
      ...transaction,
      transaction_id: newTransactionId,
      timestamp: new Date().toISOString(),
      total_price: transaction.items.reduce((total, item) => total + item.total_price, 0)
    };

    await transactionsRef.doc(newTransactionId).set(newTransaction);

    res.status(201).json({
      status: "success",
      message: "Transaction created successfully",
      data: newTransaction
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create transaction",
      error: (error instanceof Error) ? error.message : 'Unknown error'
    });
  }
};


// Get all transactions
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const transactionsRef = firestore.collection('transactions');
    const snapshot = await transactionsRef.get();
    const transactions: Transaction[] = snapshot.docs.map(doc => doc.data() as Transaction);

    res.json({
      status: "success",
      message: "Transactions retrieved successfully",
      data: {
        transactions: transactions,
        meta: {
          total: transactions.length
        }
      }
    });
  } catch (error) {
    console.error("Error retrieving transactions:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve transactions",
      error: (error instanceof Error) ? error.message : 'Unknown error'
    });
  }
};


// Get a transaction by ID
export const getTransactionById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const transactionRef = firestore.collection('transactions').doc(id);
    const transactionDoc = await transactionRef.get();

    if (transactionDoc.exists) {
      res.json({
        status: "success",
        message: "Transaction retrieved successfully",
        data: transactionDoc.data()
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "Transaction not found",
        error_code: "TRANSACTION_NOT_FOUND"
      });
    }
  } catch (error) {
    console.error("Error retrieving transaction:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve transaction",
      error: (error instanceof Error) ? error.message : 'Unknown error'
    });
  }
};


// Update a transaction
export const updateTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const transactionRef = firestore.collection('transactions').doc(id);
    const transactionDoc = await transactionRef.get();

    if (transactionDoc.exists) {
      const updatedData = req.body;

      if (updatedData.items) {
        updatedData.total_price = updatedData.items.reduce((total: number, item: { total_price: number }) => total + item.total_price, 0);
      }

      await transactionRef.update(updatedData);

      res.json({
        status: "success",
        message: "Transaction updated successfully",
        data: { ...transactionDoc.data(), ...updatedData }
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "Transaction not found",
        error_code: "TRANSACTION_NOT_FOUND"
      });
    }
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update transaction",
      error: (error instanceof Error) ? error.message : 'Unknown error'
    });
  }
};


// Delete a transaction
export const deleteTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const transactionRef = firestore.collection('transactions').doc(id);
    const transactionDoc = await transactionRef.get();

    if (transactionDoc.exists) {
      await transactionRef.delete();
      res.status(204).send();
    } else {
      res.status(404).json({
        status: "error",
        message: "Transaction not found",
        error_code: "TRANSACTION_NOT_FOUND"
      });
    }
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete transaction",
      error: (error instanceof Error) ? error.message : 'Unknown error'
    });
  }
};
