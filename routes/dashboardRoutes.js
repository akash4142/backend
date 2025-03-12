const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Stock = require("../models/Stock");
const Production = require("../models/Production");

router.get("/", async (req, res) => {
  try {
    const totalPurchases = await Order.countDocuments();
    const pendingPayments = await Order.aggregate([
      { $match: { paymentStatus: "Pending" } },
      { $group: { _id: null, totalAmount: { $sum: "$invoiceAmount" } } },
    ]);
    const totalStockItems = await Stock.countDocuments();
    const ongoingProduction = await Production.countDocuments({ status: "In Production" });

    // ✅ Latest 5 Orders
    const latestOrders = await Order.find()
      .sort({ orderDate: -1 })
      .limit(5)
      .populate("products.product supplier");

    // ✅ Orders Currently in Production
    const ordersInProduction = await Order.find({ status: { $in: ["In Production", "Packaging"] } })
      .populate("products.product");

    res.setHeader("Content-Type", "application/json"); // Ensure correct response type
    res.json({
      totalPurchases,
      pendingPayments: pendingPayments.length > 0 ? pendingPayments[0].totalAmount : 0,
      totalStockItems,
      ongoingProduction,
      latestOrders,
      ordersInProduction,
    });
  } catch (error) {
    console.error("❌ Server Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.toString() });
  }
});



// Monthly Purchase Report
router.get("/monthly-purchases", async (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const purchases = await Order.find({
      orderDate: {
        $gte: new Date(`${currentYear}-${currentMonth}-01`),
        $lt: new Date(`${currentYear}-${currentMonth + 1}-01`),
      },
    });

    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pending Payments
router.get("/pending-payments", async (req, res) => {
  try {
    const pendingPayments = await Order.find({ paymentStatus: "Pending" }).populate("product supplier");
    res.json(pendingPayments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Current Stock Levels
router.get("/stock-summary", async (req, res) => {
  try {
    const stockSummary = await Stock.find().populate("product");
    res.json(stockSummary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ongoing Production Orders
router.get("/ongoing-production", async (req, res) => {
  try {
    const productionOrders = await Production.find({ status: { $ne: "Completed" } }).populate("product");
    res.json(productionOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;