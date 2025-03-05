const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  currentStock: { type: Number, required: true, default: 0 },
  minimumStockThreshold: { type: Number, required: true, default: 5 },
  status: {
    type: String,
    enum: ["In Stock", "Low Stock", "Out of Stock"],
    default: "In Stock",
  },
  lastUpdated: { type: Date, default: Date.now },
});

// Middleware to update stock status before saving
stockSchema.pre("save", function (next) {
  if (this.currentStock <= 0) {
    this.status = "Out of Stock";
  } else if (this.currentStock < this.minimumStockThreshold) {
    this.status = "Low Stock";
  } else {
    this.status = "In Stock";
  }
  next();
});

module.exports = mongoose.model("Stock", stockSchema);
