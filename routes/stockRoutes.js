const express = require("express");
const router = express.Router();
const Stock = require("../models/Stock");
const Order = require("../models/Order");

// ✅ Get All Stock Items with Reserved Orders
router.get("/", async (req, res) => {
  try {
    const stocks = await Stock.find().populate("product");

    // Fetch all orders with reserved stock
    const reservedOrders = await Order.find({ status: "Pending" }).populate("products.product supplier");

    const updatedStock = stocks.map(stock => {
      // Find all orders that have reserved this product
      const ordersWithThisProduct = reservedOrders
        .flatMap(order =>
          order.products
            .filter(p => p.product && p.product._id.equals(stock.product._id)) // ✅ Matches product inside the array
            .map(p => ({
              orderId: order._id,
              supplier: order.supplier?.name || order.customSupplier,
              quantityReserved: p.quantity,
            }))
        );

      return {
        ...stock.toObject(),
        reservedFor: ordersWithThisProduct,
      };
    });

    res.json(updatedStock);
  } catch (error) {
    console.error("❌ Error fetching stock:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Get Low-Stock Products
router.get("/low-stock", async (req, res) => {
  try {
    const lowStockItems = await Stock.find({ status: "Low Stock" }).populate("product");
    res.json(lowStockItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get Out-of-Stock Products
router.get("/out-of-stock", async (req, res) => {
  try {
    const outOfStockItems = await Stock.find({ status: "Out of Stock" }).populate("product");
    res.json(outOfStockItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get Products by Stock Status (In Stock, Low Stock, Out of Stock)
router.get("/status/:status", async (req, res) => {
  try {
    const stockItems = await Stock.find({ status: req.params.status }).populate("product");
    res.json(stockItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Update Stock Manually
router.put("/:id", async (req, res) => {
  try {
    let stock = await Stock.findById(req.params.id);
    if (!stock) return res.status(404).json({ message: "Stock not found" });

    stock.currentStock = req.body.currentStock;
    stock.lastUpdated = new Date();
    await stock.save();

    res.json({ message: "✅ Stock updated", stock });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
