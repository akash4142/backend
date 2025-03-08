const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, // ✅ Required only if it's not a custom product
      quantity: { type: Number, required: true },
    },
  ],
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: false }, // ✅ Required only if it's not a custom supplier
  customSupplier: { type: String, default: null }, // ✅ Allows custom suppliers
  orderDate: { type: Date, default: Date.now },
  estimatedArrival: { type: Date, required: true },
  invoiceAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending","Received", "In Production", "Packaging", "Completed","Cancelled"],
    default: "Pending",
  },
  paymentDueDate: { type: Date },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Overdue", "Cancelled"],
    default: "Pending",
  },
});

module.exports = mongoose.model("Order", orderSchema);
