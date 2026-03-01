const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Connection logic for Serverless
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGO_URI);
};

const productSchema = new mongoose.Schema({
  rfid: String,
  name: String,
  price: Number,
  category: String,
  stock: Number
});

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

// Note: In Vercel, this variable resets often. For a real app, 
// you'd store 'cart' in a separate MongoDB collection.
let cart = [];

/* 1. ADD ITEM (Used by ESP8266) */
app.post("/api/add-item", async (req, res) => {
  try {
    await connectDB();
    const { rfid } = req.body; // ESP sends {"tagId": "..."} - see step 2
    
    // Find product by RFID
    const product = await Product.findOne({ rfid: rfid.toUpperCase() });

    if (!product) return res.status(404).json({ message: "Product Tag not recognized" });
    if (product.stock <= 0) return res.status(400).json({ message: "Out of stock" });

    product.stock -= 1;
    await product.save();

    cart.push(product);
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* 2. GET CART (Used by script.js) */
app.get("/api/cart", (req, res) => {
  res.json({ items: cart });
});

/* 3. PRODUCTS (Used by Catalog page) */
app.get("/api/products", async (req, res) => {
  await connectDB();
  const products = await Product.find();
  res.json(products);
});

/* 4. SEED DATA (Run this once in browser to add your tag) */
app.get("/api/seed", async (req, res) => {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany([
    { rfid: "ED027A05", name: "Amul Milk", price: 60, category: "Dairy", stock: 10 },
    { rfid: "1111", name: "Oreo", price: 30, category: "Snacks", stock: 5 }
  ]);
  res.json({ message: "Database seeded with your Tag ID!" });
});

module.exports = app;