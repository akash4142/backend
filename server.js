const productRoutes = require("./routes/productRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const orderRoutes = require("./routes/orderRoutes");
const stockRoutes = require("./routes/stockRoutes");
const productionRoutes = require("./routes/productionRoutes")
const dashboardRoutes = require("./routes/dashboardRoutes")


require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");



require("./models/Order");
require("./models/Product");
require("./models/Supplier");
require("./models/Stock")
require("./models/Production")

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("DB Connection Error:", err));

// Test Route
app.get("/", (req, res) => {
  res.send("Purchase & Production Management API is Running");
});

app.use("/api/products", productRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/production",productionRoutes);
app.use("/api/dashboard",dashboardRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//iPd3djNw8DcQrzQG
//yadavakki440
