const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const Supplier = require("./models/Supplier");
const Stock = require("./models/Stock");
const Order = require("./models/Order");
const Production = require("./models/Production");

dotenv.config();

// ✅ Connect to Database
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ Database connection error:", err));

const seedData = async () => {
  try {
    console.log("🚀 Seeding Test Data...");

    // ✅ Clear existing data
    await Product.deleteMany({});
    await Supplier.deleteMany({});
    await Stock.deleteMany({});
    await Order.deleteMany({});
    await Production.deleteMany({});

    console.log("✅ Existing data cleared");

    // ✅ Create Suppliers with Full Details
    const suppliers = await Supplier.insertMany([
      {
        name: "Tech Supply Co.",
        contactPerson: "John Doe",
        email: "john@techsupply.com",
        phone: "+1 123 456 7890",
        address: "456 Market St, Toronto, Canada",
      },
      {
        name: "Manufacture Direct",
        contactPerson: "Jane Smith",
        email: "jane@manufacturedirect.com",
        phone: "+1 987 654 3210",
        address: "789 Factory Rd, Vancouver, Canada",
      },
    ]);

    console.log("✅ Suppliers created with full contact details");

    // ✅ Create Test Products
    const products = await Product.insertMany([
      {
        name: "Industrial Gloves",
        productionProcess: "Molding & Vulcanization",
        requiredMaterials: ["Rubber", "Textile Reinforcement"],
        packagingType: "Box",
        quantityPerMasterBox: 50,
        suppliers: [suppliers[0]._id, suppliers[1]._id], // ✅ Linking to suppliers
        price: 5.0,
      },
      {
        name: "Safety Glasses",
        productionProcess: "Injection Molding & Assembly",
        requiredMaterials: ["Polycarbonate", "Elastic Bands"],
        packagingType: "Plastic Wrap",
        quantityPerMasterBox: 100,
        suppliers: [suppliers[0]._id],
        price: 10.0,
      },
      {
        name: "Hard Hat",
        productionProcess: "Molding & Assembly",
        requiredMaterials: ["HDPE", "Foam Padding"],
        packagingType: "Carton",
        quantityPerMasterBox: 20,
        suppliers: [suppliers[1]._id],
        price: 20.0,
      },
    ]);

    console.log("✅ Products created and linked to suppliers");

    // ✅ Create Stock Records
    const stocks = await Stock.insertMany([
      { product: products[0]._id, currentStock: 50, minimumStockThreshold: 10 },
      { product: products[1]._id, currentStock: 30, minimumStockThreshold: 5 },
      { product: products[2]._id, currentStock: 20, minimumStockThreshold: 3 },
    ]);

    console.log("✅ Stock records created");

    // ✅ Create Test Orders (with multiple products)
    const orders = await Order.insertMany([
      {
        products: [
          { product: products[0]._id, quantity: 10 },
          { product: products[1]._id, quantity: 5 },
        ],
        supplier: suppliers[0]._id,
        expectedDelivery: new Date(),
        estimatedArrival: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        invoiceAmount: 100,
        status: "Pending",
      },
      {
        products: [{ product: products[2]._id, quantity: 15 }],
        supplier: suppliers[1]._id,
        expectedDelivery: new Date(),
        estimatedArrival: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        invoiceAmount: 300,
        status: "In Production",
      },
      {
        products: [{ product: products[1]._id, quantity: 10 }],
        supplier: suppliers[0]._id,
        expectedDelivery: new Date(),
        estimatedArrival: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        invoiceAmount: 100,
        status: "Packaging",
      },
    ]);

    console.log("✅ Orders created with supplier details");

    // ✅ Move Some Orders to Production
    await Production.insertMany([
      {
        orderId: orders[1]._id,
        products: orders[1].products,
        status: "In Production",
        packagingProcess: "Standard",
      },
      {
        orderId: orders[2]._id,
        products: orders[2].products,
        status: "Packaging",
        packagingProcess: "Custom",
      },
    ]);

    console.log("✅ Production records created");

    // ✅ Update Stock Based on Orders
    for (let order of orders) {
      for (let item of order.products) {
        await Stock.findOneAndUpdate(
          { product: item.product },
          { $inc: { currentStock: -item.quantity, reservedStock: item.quantity } }
        );
      }
    }

    console.log("✅ Stock updated based on orders");

    console.log("🎉 Test Data Seeded Successfully! 🚀");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding test data:", error);
    mongoose.connection.close();
  }
};

seedData();
