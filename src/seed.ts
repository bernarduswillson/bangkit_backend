import { firestore } from './config/firestore';

// Sample data
let users = [
  { user_id: "user_1", name: "Alice", email: "alice@gmail.com", address: "123 Wonderland" },
];

let transactions = [
  {
    user_id: "user_1",
    transaction_id: "txn_1",
    timestamp: "2024-11-22T14:30:00Z",
    total_price: 125000,
    items: [
      { product: { user_id: "user_1", product_id: "prod_1", product_name: "Nasi Goreng Spesial", price: 25000 }, quantity: 2, total_price: 50000 },
      { product: { user_id: "user_1", product_id: "prod_2", product_name: "Es Teh Manis", price: 10000 }, quantity: 3, total_price: 30000 },
      { product: { user_id: "user_1", product_id: "prod_3", product_name: "Ayam Bakar", price: 45000 }, quantity: 1, total_price: 45000 },
    ],
  },
  {
    user_id: "user_1",
    transaction_id: "txn_2",
    timestamp: "2024-11-22T15:00:00Z",
    total_price: 75000,
    items: [
      { product: { user_id: "user_1", product_id: "prod_4", product_name: "Mie Ayam Spesial", price: 20000 }, quantity: 2, total_price: 40000 },
      { product: { user_id: "user_1", product_id: "prod_5", product_name: "Es Jeruk", price: 10000 }, quantity: 3, total_price: 30000 },
    ],
  },
  {
    user_id: "user_1",
    transaction_id: "txn_3",
    timestamp: "2024-11-22T16:00:00Z",
    total_price: 100000,
    items: [
      { product: { user_id: "user_1", product_id: "prod_6", product_name: "Sate Ayam", price: 15000 }, quantity: 5, total_price: 75000 },
      { product: { user_id: "user_1", product_id: "prod_7", product_name: "Es Campur", price: 12500 }, quantity: 2, total_price: 25000 },
    ],
  },
];

let products = [
  { user_id: "user_1", product_id: "prod_1", product_name: "Nasi Goreng Spesial", price: 25000 },
  { user_id: "user_1", product_id: "prod_2", product_name: "Es Teh Manis", price: 10000 },
  { user_id: "user_1", product_id: "prod_3", product_name: "Ayam Bakar", price: 45000 },
  { user_id: "user_1", product_id: "prod_4", product_name: "Mie Ayam Spesial", price: 20000 },
  { user_id: "user_1", product_id: "prod_5", product_name: "Es Jeruk", price: 10000 },
  { user_id: "user_1", product_id: "prod_6", product_name: "Sate Ayam", price: 15000 },
  { user_id: "user_1", product_id: "prod_7", product_name: "Es Campur", price: 12500 },
];

const seedUsers = async () => {
  for (const user of users) {
    if (user.user_id) {
      await firestore.collection("users").doc(user.user_id).set({
        name: user.name,
        email: user.email,
        address: user.address,
      });
    } else {
      console.error("User ID is undefined for user:", user);
    }
    console.log(`User ${user.user_id} added.`);
  }
};

const seedTransactions = async () => {
  for (const transaction of transactions) {
    const userDoc = firestore.collection("users").doc(transaction.user_id);
    const transactionsCollection = userDoc.collection("transactions");
    const transactionDoc = transactionsCollection.doc(transaction.transaction_id);

    await transactionDoc.set({
      timestamp: transaction.timestamp,
      total_price: transaction.total_price,
    });

    const itemsCollection = transactionDoc.collection("items");
    for (const item of transaction.items) {
      const itemDoc = itemsCollection.doc(item.product.product_id);
      await itemDoc.set({
        product: {
          product_name: item.product.product_name,
          price: item.product.price,
        },
        quantity: item.quantity,
        total_price: item.total_price,
      });
    }

    console.log(`Transaction ${transaction.transaction_id} added for user ${transaction.user_id}`);
  }
};

const seedProducts = async () => {
  for (const product of products) {
    const userDoc = firestore.collection("users").doc(product.user_id);
    const productsCollection = userDoc.collection("products");
    const productDoc = productsCollection.doc(product.product_id);

    await productDoc.set({
      product_name: product.product_name,
      price: product.price,
    });

    console.log(`Product ${product.product_id} added for user ${product.user_id}`);
  }
};

const seed = async () => {
  try {
    console.log("Seeding users...");
    await seedUsers();
    console.log("Seeding products...");
    await seedProducts();
    console.log("Seeding transactions...");
    await seedTransactions();
    console.log("Seeding completed.");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};

seed();
