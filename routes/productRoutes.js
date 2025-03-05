const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Supplier = require("../models/Supplier")

// Create a new product
router.post("/add", async (req, res) => {
  try {
    let { name, productionProcess, requiredMaterials, packagingType, quantityPerMasterBox } = req.body;

    if (!name || !productionProcess || !packagingType || !quantityPerMasterBox) {
      console.error("Validation Error: Missing fields", req.body); // ✅ Log request data
      return res.status(400).json({ message: "All fields are required, including Quantity Per Master Box" });
    }

    // ✅ Convert quantityPerMasterBox to a number
    quantityPerMasterBox = parseInt(quantityPerMasterBox, 10);
    if (isNaN(quantityPerMasterBox) || quantityPerMasterBox <= 0) {
      console.error("Validation Error: Invalid quantityPerMasterBox", req.body);
      return res.status(400).json({ message: "Quantity Per Master Box must be a positive number." });
    }

    console.log("✅ Creating new product:", req.body);

    const newProduct = new Product({
      name,
      productionProcess,
      requiredMaterials,
      packagingType,
      quantityPerMasterBox,
    });

    await newProduct.save();
    console.log("🎉 Product added successfully:", newProduct);
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    console.error("❌ Backend Error:", error); // ✅ Log error for debugging
    res.status(500).json({ error: error.message });
  }
});


// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("suppliers");
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("suppliers");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a product
router.put("/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ message: "Product updated", updatedProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a product
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
