const ExcelJS = require("exceljs");
const fs = require("fs");

const generatePurchaseOrderExcel = async (orders, filePath) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Purchase Orders");

    // ✅ Invoice Header
    worksheet.columns = [
      { header: "Order ID", key: "_id", width: 20 },
      { header: "Product", key: "product", width: 30 },
      { header: "Quantity", key: "quantity", width: 15 },
      { header: "Unit Price", key: "unitPrice", width: 15 },
      { header: "Total", key: "total", width: 15 },
      { header: "Supplier", key: "supplier", width: 25 },
      { header: "Order Date", key: "orderDate", width: 15 },
      { header: "Estimated Arrival", key: "estimatedArrival", width: 15 },
      { header: "Payment Status", key: "paymentStatus", width: 15 },
    ];

    // ✅ Populate Data
    orders.forEach((order) => {
      order.products.forEach((p) => {
        worksheet.addRow({
          _id: order._id,
          product: p.product?.name || p.customProduct || "Unknown Product",
          quantity: p.quantity,
          unitPrice: p.product?.price ? `$${p.product.price.toFixed(2)}` : "N/A",
          total: p.product?.price ? `$${(p.product.price * p.quantity).toFixed(2)}` : "N/A",
          supplier: order.supplier?.name || order.customSupplier || "Unknown Supplier",
          orderDate: new Date(order.orderDate).toLocaleDateString(),
          estimatedArrival: new Date(order.estimatedArrival).toLocaleDateString(),
          paymentStatus: order.paymentStatus,
        });
      });
    });

    // ✅ Save File & Return Path
    await workbook.xlsx.writeFile(filePath);
    console.log(`✅ Excel file created: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error("❌ Error generating Excel:", error);
    throw error;
  }
};

module.exports = { generatePurchaseOrderExcel };
