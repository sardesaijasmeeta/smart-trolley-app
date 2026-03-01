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
  stock: Number
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
      { rfid: "ED027A05", name: "Amul Milk", price: 60, category: "Dairy", stock: 10 },
      { rfid: "1111", name: "Oreo", price: 30, category: "Snacks", stock: 5 }
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
      const { rfid } = req.body;
      const cleanRfid = rfid.toUpperCase().trim();
  
      const existingInCart = await Cart.findOne({ rfid: cleanRfid });
  
      if (existingInCart) {
        await Cart.deleteOne({ rfid: cleanRfid });
        await Product.findOneAndUpdate({ rfid: cleanRfid }, { $inc: { stock: 1 } });
        return res.status(200).json({ message: "Removed" });
      } else {
        const product = await Product.findOne({ rfid: cleanRfid });
        if (!product) return res.status(404).json({ message: "Unknown Tag" });
  
        const newCartItem = new Cart({ rfid: product.rfid, name: product.name, price: product.price });
        await newCartItem.save();
        product.stock -= 1;
        await product.save();
        return res.status(200).json({ message: "Added" });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

/* GET CART ROUTE */
app.get("/api/cart", async (req, res) => {
    await connectDB();
    const items = await Cart.find().sort({ addedAt: -1 });
    res.json({ items });
});

module.exports = app;