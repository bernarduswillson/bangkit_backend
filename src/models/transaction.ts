import { Product } from "./product";

// Transaction model
export interface Transaction {
  timestamp: string;
  total_price: number;
  items?: {
    product: Product;
    quantity: number;
    total_price: number;
  }[];
}