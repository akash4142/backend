const express = require("express");
const router = express.Router();
const Production = require("../models/Production");
const Stock = require("../models/Stock");
const Product = require("../models/Product");
const Order = require("../models/Order");


// router.get("/", async (req, res) => {
//   try {
//     const productionOrders = await Production.find({ status: { $ne: "Completed" } })
//       .populate({
//         path: "orderId",
//         select: "orderNumber status", // ✅ Ensure orderNumber is fetched
//       })
//       .populate({
//         path: "products.product",
//         select: "name productionProcess packagingType quantityPerMasterBox requiredMaterials",
//         match: { _id: { $ne: null } },
//       });
//     res.status(200).json(productionOrders);
//   } catch (error) {
//     console.error("❌ Error fetching production orders:", error);
//     res.status(500).json({ error: "Failed to fetch production orders." });
//   }
// });

router.get("/", async (req, res) => {
  const productionOrders = await Production.find({ status: { $ne: "Completed" } })
  .populate({
    path: "orderId",
    select: "orderNumber status",
  })
  .populate({
    path: "products.product",
    select: "name productionProcess packagingType quantityPerMasterBox requiredMaterials",
  })
  .lean(); // ✅ Converts Mongoose documents to plain objects for filtering

// ✅ Filter out orders where all products are deleted
const filteredOrders = productionOrders
  .map((order) => ({
    ...order,
    products: order.products.filter((p) => p.product), // ✅ Remove products that are null
  }))
  .filter((order) => order.products.length > 0); // ✅ Remove orders that have NO valid products

res.status(200).json(filteredOrders);

 });

// ✅ Update Comments Separately (Fix Path)
router.put("/:id/comments", async (req, res) => {
  try {
    const { comments } = req.body;

    const production = await Production.findById(req.params.id);
    if (!production) return res.status(404).json({ message: "Production record not found." });

    production.comments = comments; // ✅ Update Comments in DB
    await production.save();

    res.json({ message: "✅ Comment updated successfully!", production });
  } catch (error) {
    console.error("❌ Error updating comments:", error);
    res.status(500).json({ error: "Failed to update comments." });
  }
});

// ✅ Move Order to Production
router.post("/start", async (req, res) => {
  try {
    const { orderId, products, packagingProcess } = req.body;

    // ✅ Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // ✅ Check if order is already in production
    const existingProduction = await Production.findOne({ orderId });
    if (existingProduction) {
      return res.status(400).json({ message: "This order is already in production." });
    }

    // ✅ Create production entries for all products in the order
    const production = new Production({
      orderId,
      products,
      packagingProcess,
      status: "In Production",
    });

    await production.save();

    // ✅ Update Order Status to "In Production"
    await Order.findByIdAndUpdate(orderId, { status: "In Production" });

    res.status(201).json({ message: "✅ Order moved to Production", production });
  } catch (error) {
    console.error("❌ Error moving order to production:", error);
    res.status(500).json({ error: "Failed to start production." });
  }
});

// ✅ Update Production Status (Move to Packaging or Completed)
router.put("/:id/status", async (req, res) => {
  try {
    const { status,comments } = req.body;
    if (!["In Production", "Packaging", "Completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status update." });
    }

    const production = await Production.findById(req.params.id);
    if (!production) return res.status(404).json({ message: "Production record not found." });

    production.status = status;
    
    if (status === "Completed") {
      production.endDate = new Date();
    }
    await production.save();


    // ✅ Update Order Status When Production Moves to "Packaging" or "Completed"
    if (status === "Packaging") {
      await Order.findByIdAndUpdate(production.orderId, { status: "Packaging" });
    } else if (status === "Completed") {
      await Order.findByIdAndUpdate(production.orderId, { status: "Completed" });
    }

    // ✅ Remove from frontend list if status is "Completed"
    if (status === "Completed") {
      await Production.deleteOne({ _id: req.params.id }); // ✅ Removes Completed Orders
    }
    
    res.json({ message: `✅ Production updated to ${status}`, production });
  } catch (error) {
    console.error("❌ Error updating production status:", error);
    res.status(500).json({ error: "Failed to update production status." });
  }
});

// ✅ Send Order to Production
router.post("/send-to-production", async (req, res) => {
  try {
    const { orderId } = req.body;

    // ✅ Find the order and populate products
    const order = await Order.findById(orderId).populate("products.product");
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // ✅ Check if order is already in production
    const existingProduction = await Production.findOne({ orderId });
    if (existingProduction) {
      return res.status(400).json({ message: "This order is already in production." });
    }

    // ✅ Create production entries for all products in the order
    const production = new Production({
      orderId,
      products: order.products.map((p) => ({
        product: p.product?._id || null,
        customProduct: p.customProduct || null,
        quantity: p.quantity,
      })),
      status: "In Production",
      packagingProcess: "Standard",
    });

    await production.save();

    // ✅ Update Order Status to "In Production"
    await Order.findByIdAndUpdate(orderId, { status: "In Production" });

    res.status(201).json({ message: "✅ Order sent to production", production });
  } catch (error) {
    console.error("❌ Error sending order to production:", error);
    res.status(500).json({ error: "Failed to send order to production." });
  }
});

module.exports = router;
