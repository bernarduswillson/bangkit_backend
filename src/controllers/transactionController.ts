import { Request, Response } from 'express';

// Model
import { Transaction } from '../models/transaction';

// Mock database
let transactions: Transaction[] = [
  {
    user_id: "user_1",
    items: [
      {
        product_id: "prod_1",
        product_name: "Nasi Goreng Spesial",
        quantity: 2,
        price_per_unit: 25000,
        total_price: 50000
      },
      {
        product_id: "prod_2",
        product_name: "Es Teh Manis",
        quantity: 3,
        price_per_unit: 10000,
        total_price: 30000
      },
      {
        product_id: "prod_3",
        product_name: "Ayam Bakar",
        quantity: 1,
        price_per_unit: 45000,
        total_price: 45000
      }
    ],
    transaction_id: "txn_1",
    timestamp: "2024-11-22T14:30:00Z",
    total_price: 125000
  },
  {
    user_id: "user_2",
    items: [
      {
        product_id: "prod_4",
        product_name: "Mie Ayam Spesial",
        quantity: 2,
        price_per_unit: 20000,
        total_price: 40000
      },
      {
        product_id: "prod_5",
        product_name: "Es Jeruk",
        quantity: 3,
        price_per_unit: 10000,
        total_price: 30000
      }
    ],
    transaction_id: "txn_2",
    timestamp: "2024-11-22T15:00:00Z",
    total_price: 75000
  },
  {
    user_id: "user_3",
    items: [
      {
        product_id: "prod_6",
        product_name: "Sate Ayam",
        quantity: 5,
        price_per_unit: 15000,
        total_price: 75000
      },
      {
        product_id: "prod_7",
        product_name: "Es Campur",
        quantity: 2,
        price_per_unit: 12500,
        total_price: 25000
      }
    ],
    transaction_id: "txn_3",
    timestamp: "2024-11-22T16:00:00Z",
    total_price: 100000
  }
];


// Create a transaction
export const createTransaction = (req: Request, res: Response) => {
  const transaction: Omit<Transaction, 'transaction_id'> = req.body;

  // Validate required fields
  if (!transaction.user_id || !transaction.items) {
    res.status(400).json({
      status: "error",
      message: "Missing required fields: user_id or items."
    });
  }

  // Generate a new transaction ID
  const lastTransaction = transactions[transactions.length - 1];
  const newTransactionId = lastTransaction ? `txn_${parseInt(lastTransaction.transaction_id.split('_')[1]) + 1}` : 'txn_1';

  const newTransaction: Transaction = {
    ...transaction,
    transaction_id: newTransactionId,
    timestamp: new Date().toISOString(),
    total_price: transaction.items.reduce((total, item) => total + item.total_price, 0)
  };
  transactions.push(newTransaction);

  res.status(201).json({
    status: "success",
    message: "Transaction created successfully",
    data: newTransaction
  });
};


// Get all transactions
export const getTransactions = (req: Request, res: Response) => {
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
};


// Get a transaction by ID
export const getTransactionById = (req: Request, res: Response) => {
  const { id } = req.params;
  // Find the transaction by ID
  const transaction = transactions.find(t => t.transaction_id === id);
  if (transaction) {
    res.json({
      status: "success",
      message: "Transaction retrieved successfully",
      data: transaction
    });
  } else {
    res.status(404).json({
      status: "error",
      message: "Transaction not found",
      error_code: "TRANSACTION_NOT_FOUND"
    });
  }
};


// Update a transaction
export const updateTransaction = (req: Request, res: Response) => {
  const { id } = req.params;
  // Find the transaction by ID
  const index = transactions.findIndex(t => t.transaction_id === id);

  if (index !== -1) {
    if (req.body.items) {
      transactions[index].items = req.body.items;
      // Update the total price
      transactions[index].total_price = transactions[index].items.reduce((total, item) => total + item.total_price, 0);
    }

    res.json({
      status: "success",
      message: "Transaction updated successfully",
      data: transactions[index]
    });
  } else {
    res.status(404).json({
      status: "error",
      message: "Transaction not found",
      error_code: "TRANSACTION_NOT_FOUND"
    });
  }
};


// Delete a transaction
export const deleteTransaction = (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = transactions.length;
  // Filter out the transaction by ID
  transactions = transactions.filter(t => t.transaction_id !== id);
  
  if (transactions.length < initialLength) {
    res.status(204).send();
  } else {
    res.status(404).json({
      status: "error",
      message: "Transaction not found",
      error_code: "TRANSACTION_NOT_FOUND"
    });
  }
};
