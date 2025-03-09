const express = require("express");
const router = express.Router();
const Stock = require("../models/Stock");
const Order = require("../models/Order");



//✅ Get Low-Stock Products
router.get("/low-stock", async (req, res) => {
  try {
    const lowStockItems = await Stock.find({ status: "Low Stock" }).populate("product");
    res.json(lowStockItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const stocks = await Stock.find().populate("product");

    // ✅ Fetch all orders with reserved stock, including `orderNumber`
    const reservedOrders = await Order.find({ status: "Pending" })
      .populate("supplier", "name")
      .select("_id orderNumber supplier products");

    const updatedStock = stocks.map(stock => {
      // ✅ Find all orders that reserved this product
      const ordersWithThisProduct = reservedOrders.filter(order =>
        order.products.some(p => p.product.equals(stock.product._id))
      );

      return {
        ...stock.toObject(),
        reservedFor: ordersWithThisProduct.map(order => ({
          orderId: order._id, // Keep for debugging if needed
          orderNumber: order.orderNumber, // ✅ Now we have `orderNumber`
          supplier: order.supplier?.name || "Unknown Supplier",
          quantityReserved: order.products.find(p => p.product.equals(stock.product._id))?.quantity || 0,
        })),
      };
    });

    res.json(updatedStock);
  } catch (error) {
    console.error("❌ Error fetching stock:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
