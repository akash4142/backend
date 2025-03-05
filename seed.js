const mongoose = require("mongoose");
const Product = require("./models/Product");
const Supplier = require("./models/Supplier");
const Order = require("./models/Order");
const Stock = require("./models/Stock");
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Database Connected!"))
  .catch((err) => console.log("❌ DB Connection Error:", err));

const seedDatabase = async () => {
  try {
    // Clear existing data
    await Product.deleteMany();
    await Supplier.deleteMany();
    await Order.deleteMany();
    await Stock.deleteMany();

    console.log("🚀 Old data deleted.");

    // ✅ Create Suppliers
    const supplier1 = new Supplier({
      name: "Tech Supply Co.",
      contactPerson: "John Doe",
      email: "john@techsupply.com",
      phone: "+1 123 456 7890",
      address: "456 Market St, Toronto, Canada",
    });

    const supplier2 = new Supplier({
      name: "Manufacture Direct",
      contactPerson: "Jane Smith",
      email: "jane@manufacturedirect.com",
      phone: "+1 987 654 3210",
      address: "789 Factory Rd, Vancouver, Canada",
    });

    await supplier1.save();
    await supplier2.save();

    console.log("✅ Suppliers added.");

    // ✅ Create Products
    const product1 = new Product({
      name: "Advanced Paint Brush",
      productionProcess: "Assembly & Finishing",
      requiredMaterials: ["Wooden Handle", "Synthetic Bristles"],
      packagingType: "Box",
      quantityPerMasterBox: 50,
      suppliers: [supplier1._id],
    });

    const product2 = new Product({
      name: "Heavy-Duty Gloves",
      productionProcess: "Chemical Treatment",
      requiredMaterials: ["Latex", "Cotton Lining"],
      packagingType: "Plastic Wrap",
      quantityPerMasterBox: 100,
      suppliers: [supplier2._id],
    });

    await product1.save();
    await product2.save();

    console.log("✅ Products added.");

    // ✅ Create Initial Stock
    const stock1 = new Stock({
      product: product1._id,
      currentStock: 200,
      minimumStockThreshold: 20,
    });

    const stock2 = new Stock({
      product: product2._id,
      currentStock: 100,
      minimumStockThreshold: 15,
    });

    await stock1.save();
    await stock2.save();

    console.log("✅ Stock added.");

    // ✅ Create Orders
    const order1 = new Order({
      product: product1._id,
      supplier: supplier1._id,
      orderedQuantity: 30,
      estimatedArrival: new Date("2025-03-10"),
      totalPrice: 600,
      status: "Pending",
    });

    const order2 = new Order({
      product: product2._id,
      supplier: supplier2._id,
      orderedQuantity: 50,
      estimatedArrival: new Date("2025-03-12"),
      totalPrice: 1200,
      status: "Received",
    });

    await order1.save();
    await order2.save();

    console.log("✅ Orders added.");

    console.log("🎉 Database seeding completed successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    mongoose.connection.close();
  }
};

// Run the seeding script
seedDatabase();
