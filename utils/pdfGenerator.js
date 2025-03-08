const PDFDocument = require("pdfkit");
const fs = require("fs");

const generatePurchaseOrderPDF = (order, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();

    try {
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      doc.fontSize(18).text("Purchase Order", { align: "center" });
      doc.moveDown();

      doc.fontSize(12).text(`Order ID: ${order._id}`);
      doc.text(`Supplier: ${order.supplier?.name || "Unknown Supplier"}`);
      doc.text(`Estimated Arrival: ${new Date(order.estimatedArrival).toLocaleDateString()}`);
      doc.text(`Payment Status: ${order.paymentStatus}`);

      doc.fontSize(14).text("Order Details",{underline:true});
      doc.moveDown();

      doc.text(`Product: ${order.product?.name || "Deleted Product"}`);
      doc.text(`Quantity Ordered: ${order.orderedQuantity}`);
      doc.text(`Order Date: ${new Date(order.orderDate).toLocaleDateString()}`);


      doc.text("Thank you for your business!", { align: "center" });
      doc.end();
      stream.on("finish", () => {
        console.log(`PDF file created: ${filePath}`);
        resolve(filePath);
      });
      stream.on("error", (err) => reject(err));
    } catch (error) {
      console.error("Error generating PDF:", error);
      reject(error);
    }
  });
};

module.exports = { generatePurchaseOrderPDF };
