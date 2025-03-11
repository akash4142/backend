const mongoose = require("mongoose");
const Product = require("./models/Product");
const Supplier = require("./models/Supplier");
const Order = require("./models/Order");
const Stock = require("./models/Stock");

require("dotenv").config(); // Ensure your `.env` file contains MONGO_URI

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));

const seedDatabase = async () => {
  try {
    console.log("🚀 Starting Data Seeding...");

    // ✅ Clear Existing Data
    await Product.deleteMany();
    await Supplier.deleteMany();
    await Order.deleteMany();
    await Stock.deleteMany();

    console.log("✅ Cleared Existing Data");

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
    console.log("✅ Suppliers Added");

    // ✅ Create Products with Initial Stock
    const product1 = new Product({
      name: "Laptop",
      productionProcess: "Assembly Line",
      requiredMaterials: ["Processor", "RAM", "Screen"],
      packagingType: "Box",
      quantityPerMasterBox: 5,
      suppliers: [supplier1._id],
      price: 1200,
      initialStock: 50,
      ASIN: "B08LK6PFL1",
      SKU: "LAP-001",
    });

    const product2 = new Product({
      name: "Wireless Headphones",
      productionProcess: "Molding",
      requiredMaterials: ["Plastic", "Battery", "Speakers"],
      packagingType: "Plastic Wrap",
      quantityPerMasterBox: 10,
      suppliers: [supplier2._id],
      price: 150,
      initialStock: 100,
      ASIN: "B08NC6PPL2",
      SKU: "HPH-002",
    });

    await product1.save();
    await product2.save();
    console.log("✅ Products Added");

    // ✅ Create Stock Records
    const stock1 = new Stock({
      product: product1._id,
      currentStock: product1.initialStock,
      minimumStockThreshold: 10,
    });

    const stock2 = new Stock({
      product: product2._id,
      currentStock: product2.initialStock,
      minimumStockThreshold: 15,
    });

    await stock1.save();
    await stock2.save();
    console.log("✅ Stock Records Added");

    // ✅ Create Orders
    const order1 = new Order({
      products: [{ product: product1._id, quantity: 2 }],
      supplier: supplier1._id,
      expectedDelivery: new Date(),
      estimatedArrival: new Date(),
      invoiceAmount: product1.price * 2,
      status: "Pending",
      paymentDueDate: new Date(new Date().setDate(new Date().getDate() + 60)),
      paymentStatus: "Pending",
    });

    const order2 = new Order({
      products: [{ product: product2._id, quantity: 5 }],
      supplier: supplier2._id,
      expectedDelivery: new Date(),
      estimatedArrival: new Date(),
      invoiceAmount: product2.price * 5,
      status: "Pending",
      paymentDueDate: new Date(new Date().setDate(new Date().getDate() + 60)),
      paymentStatus: "Pending",
    });

    await order1.save();
    await order2.save();
    console.log("✅ Orders Added");

    console.log("🎉 Database Seeding Complete!");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    mongoose.connection.close();
  }
};

// Run the seeding function
seedDatabase();
