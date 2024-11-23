import { Request, Response } from 'express';

// Model
import { Product } from '../models/product';

// Mock database
let products: Product[] = [
  {
    user_id: "user_1",
    product_id: "prod_1",
    product_name: "Nasi Goreng Spesial",
    price: 25000
  },
  {
    user_id: "user_1",
    product_id: "prod_2",
    product_name: "Es Teh Manis",
    price: 10000
  },
  {
    user_id: "user_1",
    product_id: "prod_3",
    product_name: "Ayam Bakar",
    price: 45000
  },
  {
    user_id: "user_2",
    product_id: "prod_4",
    product_name: "Mie Ayam Spesial",
    price: 20000
  },
  {
    user_id: "user_2",
    product_id: "prod_5",
    product_name: "Es Jeruk",
    price: 10000
  },
  {
    user_id: "user_3",
    product_id: "prod_6",
    product_name: "Nasi Uduk",
    price: 20000
  },
  {
    user_id: "user_3",
    product_id: "prod_7",
    product_name: "Es Campur",
    price: 15000
  }
];


// Create a product
export const createProduct = (req: Request, res: Response) => {
  const product: Omit<Product, 'product_id'> = req.body;

  // Validate required fields
  if (!product.user_id || !product.product_name || product.price === undefined) {
    res.status(400).json({
      status: "error",
      message: "Missing required fields: user_id, product_name, or price."
    });
  }

  // Generate a new product ID
  const lastProduct = products[products.length - 1];
  const newProductId = lastProduct ? `prod_${parseInt(lastProduct.product_id.split('_')[1]) + 1}` : 'prod_1';

  const newProduct: Product = {
    ...product,
    product_id: newProductId
  };
  products.push(newProduct);

  res.status(201).json({
    status: "success",
    message: "Product created successfully",
    data: newProduct
  });
};


// Get all products
export const getProducts = (req: Request, res: Response) => {
  res.json({
    status: "success",
    message: "Products retrieved successfully",
    data: {
      products: products,
      meta: {
        total: products.length
      }
    }
  })
};


// Get a product by ID
export const getProductById = (req: Request, res: Response) => {
  const { id } = req.params;
  // Find the product by ID
  const product = products.find(p => p.product_id === id);
  if (product) {
    res.json({
      status: "success",
      message: "Product retrieved successfully",
      data: product
    })
  } else {
    res.status(404).json({
      status: "error",
      message: "Product not found",
      error_code: "PRODUCT_NOT_FOUND"
    })
  }
};


// Update a product
export const updateProduct = (req: Request, res: Response) => {
  const { id } = req.params;
  // Find the product by ID
  const index = products.findIndex(p => p.product_id === id);

  if (index !== -1) {
    const { product_name, price } = req.body;
    if (product_name && price) {
      products[index].product_name = product_name;
      products[index].price = price;
    }

    res.json({
      status: "success",
      message: "Product updated successfully",
      data: products[index]
    });
  } else {
    res.status(404).json({
      status: "error",
      message: "Product not found",
      error_code: "PRODUCT_NOT_FOUND"
    });
  }
};


// Delete a product
export const deleteProduct = (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = products.length;
  // Filter out the product by ID
  products = products.filter(p => p.product_id !== id);

  if (products.length < initialLength) {
    res.status(204).send();
  } else {
    res.status(404).json({
      status: "error",
      message: "Product not found",
      error_code: "PRODUCT_NOT_FOUND"
    });
  }
};
