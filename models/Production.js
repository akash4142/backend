const mongoose = require("mongoose");

const productionSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantityToPackage: { type: Number, required: true },
  requiredMaterials: [{ type: mongoose.Schema.Types.ObjectId, ref: "Stock" }], // Track materials
  status: {
    type: String,
    enum: ["Pending", "In Process", "Completed"],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

module.exports = mongoose.model("Production", productionSchema);
