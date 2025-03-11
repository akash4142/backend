const mongoose = require("mongoose");

const productionSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: false }, // ✅ Required only if it's an existing product
      quantity: { type: Number, required: true }, // ✅ Tracks quantity of each product in production
    },
  ],
  status: {
    type: String,
    enum: ["Pending", "In Production", "Packaging", "Completed"],
    default: "Pending",
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  packagingProcess: { type: String, default: "Standard" },
  comments:{type:String,default:""},
});

module.exports = mongoose.model("Production", productionSchema);
