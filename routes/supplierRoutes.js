const express = require("express");
const router = express.Router();
const Supplier = require("../models/Supplier");

// ✅ Create a New Supplier
router.post("/", async (req, res) => {
  try {
    const { name, contactPerson, email, phone, address } = req.body;
    if (!name) return res.status(400).json({ message: "Supplier name is required!" });

    const newSupplier = new Supplier({ name, contactPerson, email, phone, address });
    await newSupplier.save();

    res.status(201).json({ message: "✅ Supplier added successfully!", supplier: newSupplier });
  } catch (error) {
    console.error("❌ Error creating supplier:", error);
    res.status(500).json({ error: "Failed to create supplier." });
  }
});

// ✅ Get all suppliers
router.get("/", async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get a single supplier by ID
router.get("/:id", async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found!" });

    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Update Supplier
router.put("/:id", async (req, res) => {
  try {
    const { name, contactPerson, email, phone, address } = req.body;
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) return res.status(404).json({ message: "Supplier not found!" });

    supplier.name = name || supplier.name;
    supplier.contactPerson = contactPerson || supplier.contactPerson;
    supplier.email = email || supplier.email;
    supplier.phone = phone || supplier.phone;
    supplier.address = address || supplier.address;

    await supplier.save();
    res.json({ message: "✅ Supplier updated successfully!", supplier });
  } catch (error) {
    console.error("❌ Error updating supplier:", error);
    res.status(500).json({ error: "Failed to update supplier." });
  }
});

// ✅ Delete Supplier
router.delete("/:id", async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found!" });

    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: "✅ Supplier deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting supplier:", error);
    res.status(500).json({ error: "Failed to delete supplier." });
  }
});

module.exports = router;
