const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  const db = await mongoose.connect(process.env.MONGO_URI);
  isConnected = db.connections[0].readyState;
};

// --- SCHEMAS ---
const productSchema = new mongoose.Schema({
  rfid: String,
  name: String,
  price: Number,
  category: String,
  stock: Number,
  aisle: String
});

const cartSchema = new mongoose.Schema({
  rfid: String,
  name: String,
  price: Number,
  addedAt: { type: Date, default: Date.now }
});

// THIS PART PREVENTS THE "NOT DEFINED" ERROR
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

/* SEED ROUTE */
app.get("/api/seed", async (req, res) => {
  try {
    await connectDB();
    await Product.deleteMany({});
    await Cart.deleteMany({});
    
    await Product.insertMany([
      { rfid: "ED027A05", name: "Gokul Milk", price: 60, category: "Dairy",aisle: "Aisle 1 ", stock: 10 },
      { rfid: "1111", name: "Oreo", price: 30, category: "Snacks",aisle: "Aisle 2 (Biscuits)", stock: 5 },
      { rfid: "6AA69B02", name: "Dark Chocolate", price: 80, aisle: "Aisle 6",category: "Snacks", stock: 8 }
    ]);
    
    res.json({ message: "Seeded Successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ADD ITEM ROUTE */
app.post("/api/add-item", async (req, res) => {
  try {
    await connectDB();
    // 1. Force uppercase and remove any hidden spaces
    const rfid = req.body.rfid.toUpperCase().trim();
    console.log("Processing RFID:", rfid);

    // 2. Check if this specific RFID is already in the Cart
    const itemInCart = await Cart.findOne({ rfid: rfid });

    if (itemInCart) {
      // REMOVE LOGIC
      await Cart.deleteOne({ _id: itemInCart._id });
      // Put 1 back into stock
      await Product.findOneAndUpdate({ rfid: rfid }, { $inc: { stock: 1 } });
      return res.status(200).json({ message: "Removed from Cart" });
    } else {
      // ADD LOGIC
      const product = await Product.findOne({ rfid: rfid });
if (!product) return res.status(404).json({ message: "Product Not Found" });
if (product.stock <= 0) return res.status(400).json({ message: "Out of Stock" });

      const newEntry = new Cart({ rfid: product.rfid, name: product.name, price: product.price });
      await newEntry.save();
      
      // Deduct 1 from stock
      product.stock -= 1;
      await product.save();
      return res.status(200).json({ message: "Added to Cart" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* GET CART ROUTE */
app.get("/api/cart", async (req, res) => {
    await connectDB();
    const items = await Cart.find().sort({ addedAt: -1 });
    res.json({ items });
});
/* GET ALL PRODUCTS */
app.get("/api/products", async (req, res) => {
    await connectDB();
    const allProducts = await Product.find();
    res.json({ products: allProducts });
});
/* CHECKOUT ROUTE */
app.post("/api/checkout", async (req, res) => {
  try {
    await connectDB();
    await Cart.deleteMany({}); // Clear the user's cart
    res.json({ message: "Payment Successful. Cart Cleared!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;