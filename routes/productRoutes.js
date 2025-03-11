const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Supplier = require("../models/Supplier")
const Stock = require("../models/Stock")

// ✅ Create a new product
router.post("/add", async (req, res) => {
  try {
    let { name, productionProcess, requiredMaterials, packagingType, quantityPerMasterBox, price, supplier,ASIN, SKU, manufacturerReference,initialStock } = req.body;

    if (!name || !productionProcess || !packagingType || !quantityPerMasterBox || !price || !ASIN || !SKU || !initialStock) {
      console.error("Validation Error: Missing fields", req.body);
      return res.status(400).json({ message: "All fields are required, including Quantity Per Master Box and Price" });
    }

    // ✅ Convert quantityPerMasterBox and price to numbers
    quantityPerMasterBox = parseInt(quantityPerMasterBox, 10);
    price = parseFloat(price);
    initialStock = parseInt(initialStock,0);

    if (isNaN(quantityPerMasterBox) || quantityPerMasterBox <= 0) {
      console.error("Validation Error: Invalid quantityPerMasterBox", req.body);
      return res.status(400).json({ message: "Quantity Per Master Box must be a positive number." });
    }
    if (isNaN(price) || price <= 0) {
      console.error("Validation Error: Invalid price", req.body);
      return res.status(400).json({ message: "Price must be a positive number." });
    }
    if (isNaN(initialStock) || initialStock < 0) {
      return res.status(400).json({ message: "Initial stock must be zero or a positive number." });
    }

    // ✅ Validate Supplier
    let supplierRef = null;
    if (supplier) {
      const existingSupplier = await Supplier.findById(supplier);
      if (!existingSupplier) {
        console.error("Validation Error: Supplier not found", supplier);
        return res.status(400).json({ message: "Invalid Supplier ID provided." });
      }
      supplierRef = existingSupplier._id;
    }

    // ✅ Check if ASIN or SKU already exists
    const existingProduct = await Product.findOne({ $or: [{ ASIN }, { SKU }] });
    if (existingProduct) {
      return res.status(400).json({ message: "ASIN or SKU already exists. Please use unique values." });
    }

    // ✅ Create and save new product
    const newProduct = new Product({
      name,
      productionProcess,
      requiredMaterials: requiredMaterials || [],
      packagingType,
      quantityPerMasterBox,
      price,
      suppliers: supplierRef ? [supplierRef] : [], // ✅ Assign supplier if provided
      ASIN: ASIN || null, // ✅ Save ASIN if provided
      SKU: SKU || null, // ✅ Save SKU if provided
      manufacturerReference: manufacturerReference || null, // ✅ Save Manufacturer Reference if provided
      initialStock,
    });

    const savedProduct = await newProduct.save();

    // ✅ Automatically add to stock
    const newStock = new Stock({
      product: savedProduct._id,
      currentStock: initialStock, // Default stock to 0
      minimumStockThreshold: 5, // Set a default threshold
    });

    await newStock.save();
    console.log("🎉 Product added successfully:", newProduct);
    res.status(201).json({ message: "✅ Product added successfully", product: newProduct });
  } catch (error) {
    console.error("❌ Backend Error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "ASIN or SKU must be unique. This value is already in use." });
    }
    res.status(500).json({ error: "Failed to add product. Please try again." });
  }
});

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("suppliers","name");
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

// ✅ Delete Product and Remove Stock Entry
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found!" });

    // ✅ Remove Stock Entry
    await Stock.findOneAndDelete({ product: req.params.id });

    // ✅ Delete the Product
    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "✅ Product and stock deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product." });
  }
});

// ✅ Update Product (Including Price)
router.put("/:id/update", async (req, res) => {
  try {
    const { name, productionProcess, packagingType, requiredMaterials, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Product name and price are required!" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, productionProcess, packagingType, requiredMaterials, price },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.json({ message: "✅ Product updated successfully!", product: updatedProduct });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({ error: "Failed to update product." });
  }
});


module.exports = router;
