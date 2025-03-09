const PDFDocument = require("pdfkit");
const fs = require("fs");

const generatePurchaseOrderPDF = (order, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();

    try {
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);


      // ✅ Invoice Details
      doc.fontSize(14).text(`Invoice ID: ${order._id}`, { align: "left" });
      doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`);
      doc.fontSize(10).text(`Supplier: ${order.supplier?.name || order.customSupplier}`);
      doc.fontSize(10).text(`Estimated Arrival: ${new Date(order.estimatedArrival).toLocaleDateString()}`);
      doc.fontSize(10).text(`Payment Status: ${order.paymentStatus}`);
      doc.moveDown();

      // ✅ Table Header
      doc.fontSize(12).text("Product", 50, 220);
      doc.text("Quantity", 250, 220);
      doc.text("Price", 350, 220);
      doc.text("Total", 450, 220);
      doc.moveDown();

      let totalAmount = 0;
      let yPosition = 250;

      order.products.forEach((p) => {
        const totalPrice = p.product.price * p.quantity;
        totalAmount += totalPrice;

        doc.text(p.product?.name || p.customProduct, 50, yPosition);
        doc.text(p.quantity, 250, yPosition);
        doc.text(`$${p.product.price.toFixed(2)}`, 350, yPosition);
        doc.text(`$${totalPrice.toFixed(2)}`, 450, yPosition);
        yPosition += 20;
      });

      // ✅ Total Amount
      doc.moveDown(2);
      doc.fontSize(14).text(`Total Invoice: $${totalAmount.toFixed(2)}`, { align: "right", bold: true });

      doc.text("Thank you for your business!", { align: "center" });
      doc.end();

      stream.on("finish", () => {
        console.log(`✅ PDF file created: ${filePath}`);
        resolve(filePath);
      });

      stream.on("error", (err) => reject(err));
    } catch (error) {
      console.error("❌ Error generating PDF:", error);
      reject(error);
    }
  });
};

module.exports = { generatePurchaseOrderPDF };
