const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

const productSchema = new mongoose.Schema({
  rfid: String,
  name: String,
  price: Number,
  category: String,
  stock: Number
});

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

let cart = [];

/* ADD ITEM */
app.post("/add-item", async (req, res) => {
  const { rfid } = req.body;

  const product = await Product.findOne({ rfid });

  if (!product) return res.status(404).json({ message: "Not found" });

  if (product.stock <= 0) {
    return res.status(400).json({ message: "Out of stock" });
  }

  product.stock -= 1;
  await product.save();

  cart.push(product);
  res.json(cart);
});

/* GET CART */
app.get("/cart", (req, res) => {
  res.json(cart);
});

/* PRODUCTS */
app.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

/* SEED */
app.get("/seed", async (req, res) => {
  await Product.deleteMany({});

  await Product.insertMany([
    { rfid: "1111", name: "Lip Balm 1", price: 100, category: "Skincare", stock: 1 },
    { rfid: "2222", name: "Lip Balm 2", price: 120, category: "Skincare", stock: 1 }
  ]);

  res.json({ message: "Seeded" });
});

module.exports = app;