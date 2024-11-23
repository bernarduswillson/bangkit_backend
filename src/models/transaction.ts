// Transaction model
export interface Transaction {
  user_id: string;
  transaction_id: string;
  timestamp: string;
  total_price: number;
  items: {
    product_id: string;
    product_name: string;
    quantity: number;
    price_per_unit: number;
    total_price: number;
  }[];
}