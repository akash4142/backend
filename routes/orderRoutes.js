const express = require("express");
const mongoose = require("mongoose")
const router = express.Router();
const Order = require("../models/Order");
const Stock = require("../models/Stock");
const Product = require("../models/Product");
const { generatePurchaseOrderPDF } = require("../utils/pdfGenerator");
const { generatePurchaseOrderExcel } = require("../utils/excelGenerator");
const fs = require("fs");


router.post("/create", async (req, res) => {
  try {
    const { products, supplier, customSupplier, expectedDelivery, invoiceNumber } = req.body;
    let { estimatedArrival } = req.body;

    if (!products || products.length === 0 || (!supplier && !customSupplier) || !expectedDelivery || !invoiceNumber) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // ✅ Ensure invoiceNumber is unique
    const existingOrder = await Order.findOne({ invoiceNumber });
    if (existingOrder) {
      return res.status(400).json({ message: "❌ Invoice number already exists!" });
    }

    let totalInvoiceAmount = 0;

    for (const item of products) {
      if (!item.product && !item.customProduct) {
        return res.status(400).json({ message: "Each product must have either an existing product or a custom product!" });
      }

      if (item.product) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ message: "❌ One of the selected products was not found!" });
        }
        totalInvoiceAmount += product.price * item.quantity;
      }
    }

    // ✅ Assign estimatedArrival if missing
    if (!estimatedArrival) {
      estimatedArrival = new Date();
      estimatedArrival.setDate(estimatedArrival.getDate() + 7);
    }

    const newOrder = new Order({
      products,
      supplier: supplier || null,
      customSupplier: customSupplier || null,
      expectedDelivery,
      estimatedArrival,
      invoiceAmount: totalInvoiceAmount,
      invoiceNumber,
      status: "Pending",
      paymentStatus: "Pending",
      paymentDueDate: new Date(new Date().setDate(new Date().getDate() + 60)),
    });

    try {
      await newOrder.save();
      return res.status(201).json({ message: "✅ Order placed successfully!", order: newOrder });
    } catch (saveError) {
      console.error("❌ Error saving order:", saveError);
      return res.status(500).json({ error: "Failed to save order." });
    }
  } catch (error) {
    console.error("❌ Error placing order:", error);
    return res.status(500).json({ error: "Failed to create order." });
  }
});


// Generate Excel report for purchase orders
router.get("/generate-excel", async (req, res) => {
  try {
    const orders = await Order.find().populate("products.product supplier");

    // Check if there are orders to generate the report
    if (!orders || orders.length === 0) {
      return res.status(400).json({ message: "No orders found to generate Excel file." });
    }

    const filePath = `./excel/purchase_orders.xlsx`;

    // Ensure directory exists
    if (!fs.existsSync("./excel")) {
      fs.mkdirSync("./excel", { recursive: true });
    }

    // Generate Excel file
    await generatePurchaseOrderExcel(orders, filePath);

    // Check if the file was generated successfully
    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ message: "Excel file generation failed." });
    }

    // Send the file for download
    res.download(filePath, "Purchase_Orders.xlsx", (err) => {
      if (err) {
        res.status(500).json({ message: "Error generating Excel file", error: err.message });
      }
    });
  } catch (error) {
    console.error("Excel Generation Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Generate PDF for an order
router.get("/:id/generate-pdf", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate({
      path: "products.product",
      select: "name price manufacturerReference", // ✅ Make sure manufacturerReference is selected
    }).populate("supplier");

    // Check if the order exists
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const filePath = `./pdfs/purchase_order_${order._id}.pdf`;

    // Ensure directory exists
    if (!fs.existsSync("./pdfs")) {
      fs.mkdirSync("./pdfs", { recursive: true });
    }

    // Generate PDF file
    await generatePurchaseOrderPDF(order, filePath);

    // Check if the file was generated successfully
    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ message: "PDF file generation failed." });
    }

    // Send the file for download
    res.download(filePath, `Purchase_Order_${order._id}.pdf`, (err) => {
      if (err) {
        res.status(500).json({ message: "Error generating PDF", error: err.message });
      }
    });
  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { productId, month, year, status, paymentStatus } = req.query;
    let filter = {status: { $ne: "Completed" }};

    // ✅ Filter by Product
    if (productId) {
      filter["products.product"] = productId;
    }

    // ✅ Filter by Status
    if (status) {
      filter.status = status;
    }

    // ✅ Filter by Payment Status
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    // ✅ Fix: Ensure correct filtering by month & year
    if (month || year) {
      let startDate, endDate;
      const selectedYear = year ? parseInt(year) : new Date().getFullYear(); // Default to current year

      if (month) {
        const selectedMonth = parseInt(month) - 1; // Convert to 0-based index

        startDate = new Date(selectedYear, selectedMonth, 1); // Start of month
        endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59); // Last day of month
      } else {
        startDate = new Date(selectedYear, 0, 1); // Start of year
        endDate = new Date(selectedYear, 11, 31, 23, 59, 59); // End of year
      }

      filter.orderDate = { $gte: startDate, $lt: endDate };
    }


    const orders = await Order.find(filter)
      .populate("products.product")
      .populate("supplier");

    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Error fetching filtered orders:", error);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});


// ✅ Order Status Update with Stock & Payment Handling
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    // ✅ Ensure status is valid
    const allowedStatuses = ["Pending", "Received", "In Production", "Packaging", "Completed", "Cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // ✅ Find the order
    const order = await Order.findById(req.params.id).populate("products.product");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const prevStatus = order.status; // Store previous status
    order.status = status;

    // ✅ Handle Stock Adjustments
    if (status === "Cancelled") {
      // Restore stock if order is canceled
      for (let item of order.products) {
        const productStock = await Stock.findOne({ product: item.product._id });
        if (productStock) {
          productStock.currentStock += item.quantity;
          await productStock.save();
        }
      }
    }

    if (status === "Received") {
      // ✅ Ensure payment status is updated
      order.paymentStatus = "Pending";

      // ✅ Deduct stock only when the order is received
      for (let item of order.products) {
        const productStock = await Stock.findOne({ product: item.product._id });
        if (productStock) {
          productStock.currentStock -= item.quantity;
          await productStock.save();
        }
      }
    }

    // ✅ Save the updated order
    await order.save();
    res.json({ message: `✅ Order status updated to ${status}.`, order });
  } catch (error) {
    console.error("❌ Backend Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// ✅ Get Purchase History with Multiple Products
router.get("/history", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("products.product supplier") // ✅ Fetch multiple products per order
      .sort({ orderDate: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Error fetching purchase history:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Mark order as received and update stock
router.put("/:id/receive", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("product");

    // Check if the order exists
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the order is already received
    if (order.status === "Received") {
      return res.status(400).json({ message: "Order already marked as received" });
    }

    // Update order status and payment due date
    order.status = "Received";
    order.paymentDueDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days later
    await order.save();

    // Update stock levels
    let stock = await Stock.findOne({ product: order.product._id });
    if (!stock) {
      // If stock entry doesn't exist, create one
      stock = new Stock({
        product: order.product._id,
        currentStock: order.quantity,
        minimumStockThreshold: 5, // Default threshold
      });
    } else {
      stock.currentStock += order.quantity;
    }
    stock.lastUpdated = new Date();
    await stock.save();

    // Check if any production orders are pending
    const pendingProductionOrders = await Production.find({
      product: order.product._id,
      status: "Pending",
    });

    if (pendingProductionOrders.length > 0) {
      return res.json({
        message: "Order received, stock updated. Production orders are pending and can now proceed.",
        order,
        stock,
        pendingProductionOrders,
      });
    }

    res.json({ message: "Order received and stock updated", order, stock });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark payment as paid
router.put("/:id/pay", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    // Check if the order exists
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update payment status
    order.paymentStatus = "Paid";
    await order.save();

    res.json({ message: "Payment updated successfully", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check for overdue payments
router.get("/overdue-payments", async (req, res) => {
  try {
    const today = new Date();
    const overdueOrders = await Order.find({ paymentStatus: "Pending", paymentDueDate: { $lt: today } });

    // Update overdue status for these orders
    overdueOrders.forEach(async (order) => {
      order.paymentStatus = "Overdue";
      await order.save();
    });

    res.json(overdueOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Update Payment Status of an Order
router.put("/:id/mark-paid", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found!" });

    // ✅ Check if it's already paid
    if (order.paymentStatus === "Paid") {
      return res.status(400).json({ message: "Order is already marked as Paid!" });
    }

    order.paymentStatus = "Paid"; // ✅ Update payment status
    await order.save();

    res.json({ message: "✅ Payment marked as Paid successfully!", order });
  } catch (error) {
    console.error("❌ Error updating payment status:", error);
    res.status(500).json({ error: "Failed to update payment status." });
  }
});

// ✅ Get Total Amount Owed to Suppliers (Only Pending Payments)
router.get("/pending-payments", async (req, res) => {
  try {
    const pendingOrders = await Order.find({ paymentStatus: "Pending" });

    const totalAmountOwed = pendingOrders.reduce((total, order) => {
      return total + order.invoiceAmount;
    }, 0);

    res.status(200).json({ totalAmountOwed });
  } catch (error) {
    console.error("❌ Error fetching pending payments:", error);
    res.status(500).json({ error: "Failed to fetch pending payments." });
  }
});


module.exports = router;