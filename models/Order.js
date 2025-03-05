const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
  customSupplier:{type:String,default:null},
  orderedQuantity: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  estimatedArrival: { type: Date, required: true },
  status: {
    type: String,
    enum: ["Pending", "In Transit", "Received","Cancelled"],
    default: "Pending",
  },
  paymentDueDate: { type: Date },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Overdue","Cancelled"],
    default: "Pending",
  },
});

module.exports = mongoose.model("Order", orderSchema);


