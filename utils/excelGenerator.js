const ExcelJS = require("exceljs");
const fs = require("fs");

const generatePurchaseOrderExcel = async (orders, filePath) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Purchase Orders");

    worksheet.columns = [
      { header: "Order ID", key: "_id", width: 25 },
      { header: "Product", key: "product", width: 20 },
      { header: "Supplier", key: "supplier", width: 20 },
      { header: "Ordered Quantity", key: "orderedQuantity", width: 15 },
      { header: "Order Date", key: "orderDate", width: 15 },
      { header: "Estimated Arrival", key: "estimatedArrival", width: 15 },
      { header: "Payment Status", key: "paymentStatus", width: 15 },
    ];

    orders.forEach((order) => {
      worksheet.addRow({
        _id: order._id,
        product: order.product?.name || "Deleted Product",
        supplier: order.supplier?.name || "Unknown Supplier",
        orderedQuantity: order.orderedQuantity,
        orderDate: new Date(order.orderDate).toLocaleDateString(),
        estimatedArrival: new Date(order.estimatedArrival).toLocaleDateString(),
        paymentStatus: order.paymentStatus,
      });
    });

    await workbook.xlsx.writeFile(filePath);
    console.log(`Excel file created: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error("Error generating Excel:", error);
    throw error;
  }
};

module.exports = { generatePurchaseOrderExcel };
