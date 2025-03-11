const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  productionProcess: { type: String, required: true },
  requiredMaterials: [{ type: String, required: true }], // List of materials
  packagingType: { type: String, required: true },
  quantityPerMasterBox: { type: Number, required: true },
  suppliers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Supplier" }], // Supplier reference
  price:{type:Number,required:true},
  ASIN: { type: String, required:true ,unique:true }, // ✅ Amazon Standard Identification Number
  SKU: { type: String, required:true,unique:true}, // ✅ Stock Keeping Unit
  manufacturerReference: { type: String, default: null }, // ✅ Manufacturer Reference
  initialStock:{type:Number,required:true,default:0}
});

module.exports = mongoose.model("Product", productSchema);
