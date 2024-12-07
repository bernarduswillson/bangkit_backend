import { Request, Response } from 'express';
import { firestore } from '../config/firestore';
import axios from 'axios';
import process from 'process';

// Model
import { Product } from '../models/product';

// Create a product
export const createProduct = async (req: Request, res: Response) => {
  const { user_id, product_name, price } = req.body;

  // Validate required fields
  if (!product_name || price === undefined) {
    res.status(400).json({
      status: "error",
      message: "Missing required fields: product_name or price."
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

    const formData = new FormData();
    formData.append('product_name', product_name);

    // Get embeddings
    const response = await axios.post(
      `${process.env.OCR_API_URL}/api/v1/embeddings/inference`,
      formData
    );

    if (!response.data || !response.data.status || response.data.status != "success") {
      res.status(500).json({
        status: "error",
        message: "Failed to create product",
        error: response.data.message || 'Unknown error'
      });
      return;
    }

    const newProduct: Product = {
      product_name,
      price,
      embeddings: response.data.data.embeddings,
    };
  
    // Add product, Users/products collection
    const productRef = await userDoc.collection("products").add(newProduct);

    const productId = productRef.id;
    res.status(201).json({
      status: "success",
      message: "Product created successfully",
      data: {
        product_id: productId,
        ...newProduct
      }
    });
    return;
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create product",
      error: (error instanceof Error) ? error.message : 'Unknown error'
    });
    return;
  };
};


// Get all products
export const getProducts = async (req: Request, res: Response) => {
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

    // Users/products collection
    const productsRef = userDoc.collection('products');
    const snapshot = await productsRef.get();
    // Retrieve products
    const products: Product[] = snapshot.docs.map(doc => ({
      product_id: doc.id,
      ...doc.data() as Product
    }));

    res.json({
      status: "success",
      message: "Products retrieved successfully",
      data: {
        products: products,
        meta: {
          total: products.length
        }
      }
    });
    return;
  } catch (error) {
    console.error("Error retrieving products:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve products",
      error: (error instanceof Error) ? error.message : 'Unknown error'
    });
    return;
  }
};


// Get a product by ID
export const getProductById = async (req: Request, res: Response) => {
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

    // Users/products collection
    const productRef = userDoc.collection('products').doc(id);
    const productDoc = await productRef.get();

    if (productDoc.exists) {
      // Retrieve product
      const productData = productDoc.data() as Product;

      res.json({
        status: "success",
        message: "Product retrieved successfully",
        data: {
          product: {
            ...productData,
          }
        }
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "Product not found",
        error_code: "PRODUCT_NOT_FOUND"
      });
    }
    return;
  } catch (error) {
    console.error("Error retrieving product:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve product",
      error: (error instanceof Error) ? error.message : 'Unknown error'
    });
    return;
  }
};


// Update a product
export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { user_id, product_name, price } = req.body;

  // Validate required fields
  if (!product_name || price === undefined) {
    res.status(400).json({
      status: "error",
      message: "Missing required fields: product_name or price."
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

    // Users/products collection
    const productRef = userDoc.collection('products').doc(id);
    const productDoc = await productRef.get();

    if (productDoc.exists) {
      const updatedData: Partial<Product> = {
        product_name,
        price,
      };
      // Update product
      await productRef.update(updatedData);

      // Retrieve updated product
      const updatedProduct = await productRef.get();

      res.json({
        status: "success",
        message: "Product updated successfully",
        data: updatedProduct.data()
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "Product not found",
        error_code: "PRODUCT_NOT_FOUND"
      });
    }
    return;
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update product",
      error: (error instanceof Error) ? error.message : 'Unknown error'
    });
    return;
  }
};


// Delete a product
export const deleteProduct = async (req: Request, res: Response) => {
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

    // Users/products collection
    const productRef = userDoc.collection('products').doc(id);
    const productDoc = await productRef.get();

    if (productDoc.exists) {
      // Delete product
      await productRef.delete();

      res.status(204).send();
    } else {
      res.status(404).json({
        status: "error",
        message: "Product not found",
        error_code: "PRODUCT_NOT_FOUND"
      });
    }
    return;
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete product",
      error: (error instanceof Error) ? error.message : 'Unknown error'
    });
    return;
  }
};
