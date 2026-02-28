const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");  // ✅ only once here

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch(err => {
    console.error("MongoDB Connection Failed");
    console.error(err);
  });

/* ---------- PRODUCT MODEL ---------- */
const productSchema = new mongoose.Schema({
  rfid: String,
  name: String,
  price: Number,
  category: String,
  image: String,
  aisle: String,
  stock: Number
});

const Product = mongoose.model("Product", productSchema);

/* ---------------- PRODUCT MAP ---------------- */
/* ---------------- PRODUCT MAP ---------------- */

/* ---------------- CART ---------------- */
let cart = [];

/* ---------------- ADD ITEM ---------------- */
/* ---------------- ADD ITEM ---------------- */
app.post("/add-item", async (req, res) => {
  try {
    const { rfid } = req.body;

    const product = await Product.findOne({ rfid: rfid });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ message: "Out of stock" });
    }

    product.stock -= 1;
    await product.save();

    cart.push(product);

    res.json(cart);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ---------------- GET CART ---------------- */
app.get("/cart", (req, res) => {
  res.json(cart);
});

/* ---------------- CLEAR CART ---------------- */
app.post("/clear-cart", (req, res) => {
  cart = [];
  res.json({ message: "Cart cleared" });
});

/* ---------------- SEED PRODUCTS (RUN ONCE) ---------------- */
app.get("/seed-products", async (req, res) => {
  try {
    await Product.deleteMany({});

    const products = [
      {
        rfid: "ED 02 7A 05",   // your white card UID
        name: "Lip Balm 1",
        price: 150,
        category: "Skincare",
        aisle: "Aisle 3",
        image: "",
        stock: 1
      },
      {
        rfid: "6A A6 9B 02",   // your blue tag UID
        name: "Lip Balm 2",
        price: 180,
        category: "Skincare",
        aisle: "Aisle 3",
        image: "",
        stock: 1
      }
    ];

    await Product.insertMany(products);

    res.json({ message: "Skincare products seeded successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
/* ---------------- GET ALL PRODUCTS ---------------- */
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});