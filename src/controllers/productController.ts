import { Request, Response } from 'express';
import { firestore } from '../utils/firestoreClient';

// Model
import { Product } from '../models/product';


// Create a product
export const createProduct = async (req: Request, res: Response) => {
  const product: Omit<Product, 'product_id'> = req.body;

  // Validate required fields
  if (!product.user_id || !product.product_name || product.price === undefined) {
    res.status(400).json({
      status: "error",
      message: "Missing required fields: user_id, product_name, or price."
    });
  }

  try {
    // Generate a new product ID
    const productsRef = firestore.collection('products');
    const lastProductSnapshot = await productsRef.orderBy('product_id', 'desc').limit(1).get();
    const newProductId = lastProductSnapshot.empty ? 'prod_1' : `prod_${parseInt(lastProductSnapshot.docs[0].id.split('_')[1]) + 1}`;

    const newProduct: Product = {
      ...product,
      product_id: newProductId
    };

    await productsRef.doc(newProductId).set(newProduct);

    res.status(201).json({
      status: "success",
      message: "Product created successfully",
      data: newProduct
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create product",
      error: (error instanceof Error) ? error.message : 'Unknown error'
    });
  }
};


// Get all products
export const getProducts = async (req: Request, res: Response) => {
  try {
    const productsRef = firestore.collection('products');
    const snapshot = await productsRef.get();
    const products: Product[] = snapshot.docs.map(doc => doc.data() as Product);

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
  } catch (error) {
    console.error("Error retrieving products:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve products",
      error: (error instanceof Error) ? error.message : 'Unknown error'
    });
  }
};


// Get a product by ID
export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const productRef = firestore.collection('products').doc(id);
    const productDoc = await productRef.get();

    if (productDoc.exists) {
      res.json({
        status: "success",
        message: "Product retrieved successfully",
        data: productDoc.data()
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "Product not found",
        error_code: "PRODUCT_NOT_FOUND"
      });
    }
  } catch (error) {
    console.error("Error retrieving product:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve product",
      error: (error instanceof Error) ? error.message : 'Unknown error'
    });
  }
};


// Update a product
export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const productRef = firestore.collection('products').doc(id);
    const productDoc = await productRef.get();

    if (productDoc.exists) {
      const updatedData = req.body;

      // Update the product fields
      await productRef.update(updatedData);

      // Retrieve the updated product
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
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update product",
      error: (error instanceof Error) ? error.message : 'Unknown error'
    });
  }
};


// Delete a product
export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const productRef = firestore.collection('products').doc(id);
    const productDoc = await productRef.get();

    if (productDoc.exists) {
      await productRef.delete();
      res.status(204).send();
    } else {
      res.status(404).json({
        status: "error",
        message: "Product not found",
        error_code: "PRODUCT_NOT_FOUND"
      });
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete product",
      error: (error instanceof Error) ? error.message : 'Unknown error'
    });
  }
};
