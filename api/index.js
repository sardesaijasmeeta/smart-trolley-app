const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

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

// Schema for items currently in the trolley
const cartSchema = new mongoose.Schema({
  rfid: String,
  name: String,
  price: Number,
  addedAt: { type: Date, default: Date.now }
});

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

/* TOGGLE ITEM (Add/Remove) */
app.post("/api/add-item", async (req, res) => {
  try {
    await connectDB();
    const { rfid } = req.body;
    const cleanRfid = rfid.toUpperCase().trim();

    // Check if item is already in cart
    const existingInCart = await Cart.findOne({ rfid: cleanRfid });

    if (existingInCart) {
      // REMOVE LOGIC: Item taken out of trolley
      await Cart.deleteOne({ rfid: cleanRfid });
      await Product.findOneAndUpdate({ rfid: cleanRfid }, { $inc: { stock: 1 } });
      return res.status(200).json({ message: "Item removed from cart" });
    } else {
      // ADD LOGIC: Item put into trolley
      const product = await Product.findOne({ rfid: cleanRfid });
      if (!product) return res.status(404).json({ message: "Unknown Tag" });
      if (product.stock <= 0) return res.status(400).json({ message: "Out of stock" });

      const newCartItem = new Cart({ rfid: product.rfid, name: product.name, price: product.price });
      await newCartItem.save();
      
      product.stock -= 1;
      await product.save();
      
      return res.status(200).json({ message: "Item added to cart" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/cart", async (req, res) => {
  await connectDB();
  const items = await Cart.find().sort({ addedAt: -1 });
  res.json({ items });
});

app.get("/api/seed", async (req, res) => {
  await connectDB();
  await Product.deleteMany({});
  await Cart.deleteMany({});
  await Product.insertMany([
    { rfid: "ED027A05", name: "Amul Milk", price: 60, category: "Dairy", stock: 10 },
    { rfid: "1111", name: "Oreo", price: 30, category: "Snacks", stock: 5 }
  ]);
  res.json({ message: "Database Cleaned & Seeded" });
});

module.exports = app;