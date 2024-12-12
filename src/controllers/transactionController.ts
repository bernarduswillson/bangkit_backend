import { Request, Response } from 'express';
import { firestore } from '../config/firestore';
import axios from 'axios';
import process from 'process';

// Model
import { Transaction } from '../models/transaction';


interface Item {
  product_id: string;
  quantity: number;
}

interface MulterRequest extends Request {
  // eslint-disable-next-line no-undef
  file?: Express.Multer.File;
}

// OCR transaction
export const ocrTransaction = async (req: MulterRequest, res: Response) => {
  const { user_id } = req.body;
  const image = req.file;

  // Validate user
  const userDoc = firestore.collection("users").doc(user_id);
  const userSnapshot = await userDoc.get();
  if (!userSnapshot.exists) {
    res.status(404).json({
      status: "error",
      message: `User ${user_id} not found`,
    });
    return;
  }

  // Validate required fields
  if (!image || !image.buffer) {
    res.status(400).json({
      status: 'error',
      message: 'Missing required field: image.',
    });
    return;
  }

  // Validate file type
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedMimeTypes.includes(image.mimetype)) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid file type. Only JPEG, PNG, and JPG are allowed.',
    });
    return;
  }

  // Validate file size
  const maxSize = 5 * 1024 * 1024;
  if (image.size > maxSize) {
    res.status(400).json({
      status: 'error',
      message: 'File size exceeds the maximum limit of 5 MB.',
    });
    return;
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
    return;
  } catch (error) {
    console.error('Error in OCR transaction:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process OCR transaction.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
};


// Create a transaction
export const createTransaction = async (req: Request, res: Response) => {
  const { user_id, items } = req.body;

  // Validate required fields
  if (!items || items.length === 0 || items.some((item: Item) => !item.product_id || !item.quantity)) {
    res.status(400).json({
      status: "error",
      message: "Missing required fields: items, product_id, or quantity."
    });
    return;
  }

  try {
    // Users document
    const userDoc = firestore.collection("users").doc(user_id);
    const userSnapshot = await userDoc.get();
    if (!userSnapshot.exists) {
      res.status(404).json({
        status: "error",
        message: `User ${user_id} not found`,
      });
      return;
    }

    const newTransaction: Transaction = {
      timestamp: new Date().toISOString(),
      total_price: 0,
    };

    // Find items in Users/products collection
    const productsCollection = userDoc.collection("products");
    for (const item of items) {
      const { product_id, quantity } = item;
      const productDoc = await productsCollection.doc(product_id).get();
      if (!productDoc.exists) {
        res.status(404).json({
          status: "error",
          message: `Product ${product_id} not found`,
        });
        return;
      }

      const productData = productDoc.data();
      if (productData) {
        newTransaction.total_price += productData.price * quantity;
      }
    }

    // Add transaction
    const transactionRef = await userDoc.collection("transactions").add(newTransaction);

    // Add items to transaction
    const itemsCollection = transactionRef.collection("items");
    for (const item of items) {
      const { product_id, quantity } = item;
      const productDoc = await productsCollection.doc(product_id).get();
      const productData = productDoc.data();
      if (productData) {
        await itemsCollection.doc(product_id).set({
          product: {
            product_name: productData.product_name,
            price: productData.price,
          },
          quantity,
          total_price: productData.price * quantity,
        });
      }
    }

    const transactionId = transactionRef.id;
    res.status(201).json({
      status: "success",
      message: "Transaction created successfully",
      data: {
        transaction_id: transactionId,
        ...newTransaction
      }
    });
    return;
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create transaction",
      error: (error instanceof Error) ? error.message : 'Unknown error'
    });
    return;
  }
};


// Get all transactions
export const getTransactions = async (req: Request, res: Response) => {
  const { user_id } = req.body;
  try {
    // Users document
    const userDoc = firestore.collection("users").doc(user_id);
    const userSnapshot = await userDoc.get();
    if (!userSnapshot.exists) {
      res.status(404).json({
        status: "error",
        message: `User ${user_id} not found`,
      });
      return;
    }

    // Transactions subcollection
    const transactionsRef = userDoc.collection('transactions');
    const transactionsSnapshot = await transactionsRef.get();

    // Retrieve transactions and their items
    const transactions = await Promise.all(
      transactionsSnapshot.docs.map(async (transactionDoc) => {
        const transactionData = transactionDoc.data();
        const itemsRef = transactionDoc.ref.collection('items');
        const itemsSnapshot = await itemsRef.get();

        // Retrieve items for each transaction
        const items = itemsSnapshot.docs.map((itemDoc) => {
          const itemData = itemDoc.data();
          return {
            product_id: itemDoc.id,
            product_name: itemData.product_name || '',
            price_per_unit: itemData.price_per_unit || 0,
            quantity: itemData.quantity || 0,
            total_price: itemData.total_price || 0,
          };
        });

        return {
          transaction_id: transactionDoc.id,
          timestamp: transactionData.timestamp || null,
          total_price: transactionData.total_price || 0,
          items,
        };
      })
    );

    res.json({
      status: "success",
      message: "Transactions retrieved successfully",
      data: {
        transactions,
        meta: {
          total: transactions.length,
        },
      },
    });
    return
  } catch (error) {
    console.error("Error retrieving transactions:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve transactions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return
  }
};

// Get top 5 products
export const getTop5Products = async (req: Request, res: Response) => {
  const { user_id } = req.body;
  try {
    const userDoc = firestore.collection("users").doc(user_id);
    const userSnapshot = await userDoc.get();
    if (!userSnapshot.exists) {
      res.status(404).json({
        status: "error",
        message: `User ${user_id} not found`,
      });
      return;
    }

    const transactionsRef = userDoc.collection("transactions");
    const transactionsSnapshot = await transactionsRef.get();

    const productQuantities: Record<string, { product_name: string; total_quantity: number }> = {};

    await Promise.all(
      transactionsSnapshot.docs.map(async (transactionDoc) => {
        const itemsRef = transactionDoc.ref.collection("items");
        const itemsSnapshot = await itemsRef.get();

        itemsSnapshot.docs.forEach((itemDoc) => {
          const itemData = itemDoc.data();
          const productId = itemDoc.id;

          if (!productQuantities[productId]) {
            productQuantities[productId] = {
              product_name: itemData.product_name || "",
              total_quantity: 0,
            };
          }
          productQuantities[productId].total_quantity += itemData.quantity || 0;
        });
      })
    );

    const topProducts = Object.entries(productQuantities)
      .map(([product_id, data]) => ({
        product_id,
        product_name: data.product_name,
        total_quantity: data.total_quantity,
      }))
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, 5);

    res.json({
      status: "success",
      message: "Top 5 products retrieved successfully",
      data: topProducts,
    });
  } catch (error) {
    console.error("Error retrieving top 5 products:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve top 5 products",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};


// Get a transaction by ID
export const getTransactionById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { user_id } = req.body;

  try {
    // Users document
    const userDoc = firestore.collection("users").doc(user_id);
    const userSnapshot = await userDoc.get();
    if (!userSnapshot.exists) {
      res.status(404).json({
        status: "error",
        message: `User ${user_id} not found`,
      });
      return;
    }

    // Users/transactions collection
    const transactionRef = userDoc.collection('transactions').doc(id);
    const transactionDoc = await transactionRef.get();

    if (transactionDoc.exists) {
      // Retrieve transaction
      const transactionData = transactionDoc.data();

      // Retrieve items
      const itemsCollection = transactionRef.collection('items');
      const itemsSnapshot = await itemsCollection.get();
      if (transactionData) {
        transactionData.items = itemsSnapshot.docs.map(doc => ({
          product: {
            product_id: doc.id,
            ...doc.data().product
          },
          quantity: doc.data().quantity,
          total_price: doc.data().total_price
        }));
      }

      res.json({
        status: "success",
        message: "Transaction retrieved successfully",
        data: {
          transaction: {
            ...transactionData
          }
        }
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "Transaction not found",
        error_code: "TRANSACTION_NOT_FOUND"
      });
    }
    return;
  } catch (error) {
    console.error("Error retrieving transaction:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve transaction",
      error: (error instanceof Error) ? error.message : 'Unknown error'
    });
    return;
  }
};


// Update a transaction
export const updateTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { user_id, items } = req.body;

  // Validate required fields
  if (!items || items.length === 0 || items.some((item: Item) => !item.product_id || !item.quantity)) {
    res.status(400).json({
      status: "error",
      message: "Missing required fields: items, product_id, or quantity."
    });
    return;
  }

  try {
    // Users document
    const userDoc = firestore.collection("users").doc(user_id);
    const userSnapshot = await userDoc.get();
    if (!userSnapshot.exists) {
      res.status(404).json({
        status: "error",
        message: `User ${user_id} not found`,
      });
      return;
    }

    // Users/transactions collection
    const transactionRef = userDoc.collection('transactions').doc(id);
    const transactionDoc = await transactionRef.get();

    if (transactionDoc.exists) {
      const updatedData: Partial<Transaction> = {
        timestamp: new Date().toISOString(),
        total_price: 0,
      };

      // Find items in Users/products collection
      const productsCollection = userDoc.collection("products");
      for (const item of items) {
        const { product_id, quantity } = item;
        const productDoc = await productsCollection.doc(product_id).get();
        if (!productDoc.exists) {
          res.status(404).json({
            status: "error",
            message: `Product ${product_id} not found`,
          });
          return;
        }

        const productData = productDoc.data();
        if (productData) {
          updatedData.total_price = (updatedData.total_price || 0) + productData.price * quantity;
        }
      }
    
      // Update transaction
      await transactionRef.update(updatedData);

      // Update items in transaction
      const itemsCollection = transactionRef.collection("items");
      for (const item of items) {
        const { product_id, quantity } = item;
        const productDoc = await productsCollection.doc(product_id).get();
        const productData = productDoc.data();
        if (productData) {
          await itemsCollection.doc(product_id).set({
            product: {
              product_name: productData.product_name,
              price: productData.price,
            },
            quantity,
            total_price: productData.price * quantity,
          });
        }
      }

      // const transactionDoc = await transactionRef.get();
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
    return;
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update transaction",
      error: (error instanceof Error) ? error.message : 'Unknown error'
    });
    return;
  }
};


// Delete a transaction
export const deleteTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { user_id } = req.body;

  try {
    // Users document
    const userDoc = firestore.collection("users").doc(user_id);
    const userSnapshot = await userDoc.get();
    if (!userSnapshot.exists) {
      res.status(404).json({
        status: "error",
        message: `User ${user_id} not found`,
      });
      return;
    }

    // Users/transactions collection
    const transactionRef = userDoc.collection('transactions').doc(id);
    const transactionDoc = await transactionRef.get();

    if (transactionDoc.exists) {
      // Delete transaction
      await transactionRef.delete();

      res.status(204).send();
    } else {
      res.status(404).json({
        status: "error",
        message: "Transaction not found",
        error_code: "TRANSACTION_NOT_FOUND"
      });
    }
    return;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete transaction",
      error: (error instanceof Error) ? error.message : 'Unknown error'
    });
    return;
  }
};