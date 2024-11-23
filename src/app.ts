// Imports
import express from 'express';
import process from 'process';

// Routes
import transactionRoutes from './routes/transactionRoutes';

// App
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/v1/transactions', transactionRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});