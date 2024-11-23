import express from 'express';
import process from 'process';
import dotenv from 'dotenv'; 
dotenv.config();

// Routes
import transactionRoutes from './routes/transactionRoutes';
import productRoutes from './routes/productRoutes';

// App
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/products', productRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});