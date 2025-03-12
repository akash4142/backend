const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Stock = require("../models/Stock");
const Production = require("../models/Production");

// // Dashboard Overview
// router.get("/", async (req, res) => {
//   try {
//     const totalPurchases = await Order.countDocuments();
//     const pendingPayments = await Order.find({ paymentStatus: "Pending" }).countDocuments();
//     const totalStockItems = await Stock.countDocuments();
//     const ongoingProduction = await Production.find({ status: { $ne: "Completed" } }).countDocuments();

//     res.json({
//       totalPurchases,
//       pendingPayments,
//       totalStockItems,
//       ongoingProduction,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

router.get("/", async (req, res) => {
  try {
    const totalPurchases = await Order.countDocuments();
    const pendingPayments = await Order.aggregate([
      { $match: { paymentStatus: "Pending" } },
      { $group: { _id: null, totalAmount: { $sum: "$invoiceAmount" } } },
    ]);
    const totalStockItems = await Stock.countDocuments();
    const ongoingProduction = await Production.countDocuments({ status: "In Production" });

    // ✅ Monthly Purchase & Payment Data
    const financeTrends = await Order.aggregate([
      { $group: { _id: { month: { $month: "$orderDate" } }, purchases: { $sum: 1 }, paymentsDue: { $sum: "$invoiceAmount" } } },
      { $sort: { "_id.month": 1 } }
    ]);

    // ✅ Orders Pending vs Completed
    const productionData = [
      { name: "Pending Orders", value: await Order.countDocuments({ status: "Pending" }) },
      { name: "Completed Orders", value: await Order.countDocuments({ status: "Completed" }) },
    ];

    // ✅ Stock Trends Over Time
    const stockTrends = await Stock.aggregate([
      { $group: { _id: { month: { $month: "$lastUpdated" } }, stockLevel: { $sum: "$currentStock" } } },
      { $sort: { "_id.month": 1 } }
    ]);

    res.json({
      totalPurchases,
      pendingPayments: pendingPayments.length > 0 ? pendingPayments[0].totalAmount : 0,
      totalStockItems,
      ongoingProduction,
      financeTrends,
      productionData,
      stockTrends,
    });
  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats." });
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