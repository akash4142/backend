const express = require("express");
const router = express.Router();
const Production = require("../models/Production");
const Stock = require("../models/Stock");
const Product = require("../models/Product");

// Create a new production order
router.post("/create", async (req, res) => {
  try {
    const { product, quantityToPackage } = req.body;

    const existingProduct = await Product.findById(product);
    if (!existingProduct) return res.status(404).json({ message: "Product not found" });

    // Check if enough materials exist
    const materials = await Stock.find({ product: { $in: existingProduct.requiredMaterials } });
    let insufficientMaterials = materials.filter((mat) => mat.currentStock < quantityToPackage);

    if (insufficientMaterials.length > 0) {
      return res.status(400).json({ message: "Not enough materials in stock", insufficientMaterials });
    }

    const productionOrder = new Production({
      product,
      quantityToPackage,
      requiredMaterials: existingProduct.requiredMaterials,
    });

    await productionOrder.save();
    res.status(201).json({ message: "Production order created", productionOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all production orders
router.get("/", async (req, res) => {
  try {
    const productionOrders = await Production.find().populate("product requiredMaterials");
    res.json(productionOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update production order status
router.put("/:id/update-status", async (req, res) => {
  try {
    const { status } = req.body;
    const productionOrder = await Production.findById(req.params.id);
    if (!productionOrder) return res.status(404).json({ message: "Production order not found" });

    productionOrder.status = status;

    if (status === "Completed") {
      productionOrder.completedAt = new Date();

      // Deduct materials from stock
      for (let materialId of productionOrder.requiredMaterials) {
        let stockItem = await Stock.findById(materialId);
        if (stockItem) {
          stockItem.currentStock -= productionOrder.quantityToPackage;
          await stockItem.save();
        }
      }
    }

    await productionOrder.save();
    res.json({ message: "Production order updated", productionOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get production orders by status
router.get("/status/:status", async (req, res) => {
  try {
    const orders = await Production.find({ status: req.params.status }).populate("product");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
