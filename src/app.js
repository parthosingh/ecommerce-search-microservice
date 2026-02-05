require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const productRoutes = require('./routes/v1/productRoutes');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1', productRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const productService = require('./services/productService');
const searchService = require('./services/searchService');

// Seed some sample data on startup
(function seedData() {
  productService.addProduct({
    title: "iPhone 14",
    description: "Latest iPhone model with great camera and battery life",
    price: 59999,
    mrp: 69999,
    rating: 4.7,
    stock: 150,
    sales: 3200,
    category: "mobile",
    metadata: { color: "black", storage: "128GB", year: 2022 }
  });

  productService.addProduct({
    title: "iPhone 15 Pro",
    description: "Premium iPhone with A17 chip and titanium design",
    price: 129999,
    mrp: 149999,
    rating: 4.8,
    stock: 45,
    sales: 1800,
    category: "mobile",
    metadata: { color: "black titanium", storage: "256GB", year: 2024 }
  });

  productService.addProduct({
    title: "Samsung Galaxy S23",
    description: "Flagship Android phone with excellent display",
    price: 74999,
    mrp: 84999,
    rating: 4.6,
    stock: 80,
    sales: 4500,
    category: "mobile",
    metadata: { color: "green", storage: "256GB", year: 2023 }
  });

  productService.addProduct({
    title: "iPhone 13 Silicone Cover Red",
    description: "Strong and stylish protective cover",
    price: 499,
    mrp: 999,
    rating: 4.3,
    stock: 500,
    sales: 12000,
    category: "accessory",
    metadata: { color: "red", compatible: "iPhone 13" }
  });

  console.log(`Sample products added: ${productService.getAllProducts().length}`);

  // Initialize search index
  searchService.initialize();
  console.log("Search index initialized");
})();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Test examples:`);
  console.log(`→ http://localhost:${PORT}/api/v1/search/product?query=sasta%20iphone`);
  console.log(`→ http://localhost:${PORT}/api/v1/search/product?query=iphone%20red`);
  console.log(`→ http://localhost:${PORT}/api/v1/search/product?query=ifone`);
});