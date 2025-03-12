const PDFDocument = require("pdfkit");
const fs = require("fs");

const generatePurchaseOrderPDF = (order, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });

    try {
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ✅ Header - Company Title with Blue Background
      doc.rect(40, 40, 520, 70).fill("#004080");
      doc
        .fillColor("white")
        .font("Helvetica-Bold")
        .fontSize(24)
        .text("MARECOM ONSIDE COOP. V.", 50, 60, { align: "center" });

      doc.moveDown(1);
      doc.fillColor("white").fontSize(16).text("PURCHASE ORDER", { align: "center" });

      // ✅ Order Date & Order Number
      doc.moveDown(2);
      doc.fillColor("black").fontSize(12);
      doc.text(` DATE: ${new Date().toLocaleDateString()}`, 50, 130);
      doc.text(` ORDER NUMBER: ${order.orderNumber || "N/A"}`, 50, 145);

      // ✅ Shipping & Vendor Information
      doc.moveDown(2);
      doc.fillColor("#004080").fontSize(12).text(" SHIP TO:", 50, 170);
      doc.fillColor("black").fontSize(10);
      doc.text("Marecom Onside Coop. V.");
      doc.text("CIF: F72985682");
      doc.text("C/ Benito Pérez Galdos 17C, Pinoso, Alicante, 03650");
      doc.text(" Phone: 656 36 19 05");

      doc.moveDown(1);
      doc.fillColor("#004080").fontSize(12).text(" VENDOR:", 350, 170);
      doc.fillColor("black").fontSize(10);
      doc.text(`${order.supplier?.name || order.customSupplier}`, 350);
      doc.text(` Address: ${order.supplier?.address || "N/A"}`, 350);
      doc.text(` Phone: ${order.supplier?.phone || "N/A"}`, 350);

      doc.moveDown(2);

      // ✅ Table Header with Blue Background
      const tableTop = 250;
      doc.fillColor("#004080").rect(40, tableTop, 520, 25).fill();
      doc
        .fillColor("white")
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("ITEM #", 50, tableTop + 7)
        .text("DESCRIPTION", 120, tableTop + 7)
        .text("QTY", 280, tableTop + 7)
        .text("UNIT PRICE", 370, tableTop + 7)
        .text("TOTAL", 470, tableTop + 7);

      let totalAmount = 0;
      let yPosition = tableTop + 35;

      // ✅ Products in Table Format
      order.products.forEach((p, index) => {
        const totalPrice = p.product.price * p.quantity;
        totalAmount += totalPrice;

        if (index % 2 === 0) {
          doc.fillColor("#F2F2F2").rect(40, yPosition - 5, 520, 20).fill();
        }
        doc.fillColor("black").font("Helvetica");

        doc
          .fontSize(10)
          .text(index + 1, 50, yPosition)
          .text(p.product?.name || p.customProduct, 120, yPosition)
          .text(p.quantity, 280, yPosition)
          .text(`€${p.product.price.toFixed(2)}`, 370, yPosition)
          .text(`€${totalPrice.toFixed(2)}`, 470, yPosition);

        yPosition += 20;
      });

      // ✅ Total Summary Box (Grey Background, Right Aligned)
      doc.fillColor("#E0E0E0").rect(300, yPosition + 10, 260, 80).fill();
      doc.fillColor("black").fontSize(11);
      doc.text(`SUBTOTAL: €${totalAmount.toFixed(2)}`, 310, yPosition + 15);
      doc.text(`TAX RATE: 0.00%`, 310, yPosition + 35);
      doc.text(`TOTAL: €${totalAmount.toFixed(2)}`, 310, yPosition + 55, { bold: true });

      // ✅ Footer Section (Right-Aligned, Proper Spacing)
      doc.moveDown(5);
      doc.fillColor("black").fontSize(10).font("Helvetica");
      doc.text("Authorized by: Marcos Carrillo", 350);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 350);
      doc.moveDown(2);
      doc.text(
        ` If you have any questions regarding this purchase order, feel free to contact us.`,
        350
      );
      doc.text(`Email: purchases@marecomgroup.com`, 350);
      doc.text(`Phone: 656 36 19 05`, 350);

      doc.end();

      stream.on("finish", () => {
        console.log(` PDF file created: ${filePath}`);
        resolve(filePath);
      });

      stream.on("error", (err) => reject(err));
    } catch (error) {
      console.error(" Error generating PDF:", error);
      reject(error);
    }
  });
};

module.exports = { generatePurchaseOrderPDF };
