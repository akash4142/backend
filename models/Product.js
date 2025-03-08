const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  productionProcess: { type: String, required: true },
  requiredMaterials: [{ type: String, required: true }], // List of materials
  packagingType: { type: String, required: true },
  quantityPerMasterBox: { type: Number, required: true },
  suppliers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Supplier" }], // Supplier reference
  price:{type:Number,required:true},
});

module.exports = mongoose.model("Product", productSchema);
