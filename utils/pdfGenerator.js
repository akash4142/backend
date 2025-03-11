const PDFDocument = require("pdfkit");
const fs = require("fs");

const generatePurchaseOrderPDF = (order, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });

    try {
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ✅ Company Header with Blue Background
      doc.rect(40, 40, 520, 60).fill("#005792");
      doc
        .fillColor("white")
        .fontSize(22)
        .text("MARECOM ONSIDE COOP. V.", 50, 60, {
          align: "center",
          bold: true,
        });

      doc.moveDown(2);
      doc
        .fillColor("black")
        .fontSize(16)
        .text(`PURCHASE ORDER`, { align: "center", bold: true });
      doc.moveDown(1);

      // ✅ Order Date on the Left
      doc
        .fontSize(10)
        .text(`DATE: ${new Date().toLocaleDateString()}`, 50, 130, {
          bold: true,
        });
      doc.moveDown(2);

      // ✅ Ship-To Address on the Left & Vendor Information on the Right
      doc.moveDown(2);
      doc.fontSize(10).text(`SHIP TO:`, 50, 150, { bold: true });
      doc.text(`Marecom Onside Coop. V.`);
      doc.text(`CIF: F72985682`);
      doc.text(`C/ Benito Pérez Galdos 17C, Pinoso, Alicante, 03650`);
      doc.text(`Phone: 656 36 19 05`);

      doc.moveDown(2);
      doc.fontSize(10).text(`VENDOR:`, 350, 150, { bold: true });
      doc.text(`${order.supplier?.name || order.customSupplier}`, 350);
      doc.text(`Address: ${order.supplier?.address || "N/A"}`, 350);
      doc.text(`Phone: ${order.supplier?.phone || "N/A"}`, 350);
      doc.moveDown(2);

      // ✅ Table Header with Blue Background
      const tableTop = 230;
      doc.fillColor("#005792").rect(40, tableTop, 520, 20).fill();
      doc
        .fillColor("white")
        .fontSize(10)
        .text("ITEM #", 50, tableTop + 5)
        .text("DESCRIPTION", 120, tableTop + 5)
        .text("QTY", 270, tableTop + 5)
        .text("UNIT PRICE", 350, tableTop + 5)
        .text("TOTAL", 450, tableTop + 5);
      doc.moveDown(0.5);

      let totalAmount = 0;
      let yPosition = tableTop + 25;

      // ✅ Products in a Proper Table Format
      order.products.forEach((p, index) => {
        const totalPrice = p.product.price * p.quantity;
        totalAmount += totalPrice;

        // ✅ Alternate row shading
        if (index % 2 === 0) {
          doc
            .fillColor("#F2F2F2")
            .rect(40, yPosition - 5, 520, 20)
            .fill();
        }
        doc.fillColor("black");

        doc
          .fontSize(10)
          .text(index + 1, 50, yPosition)
          .text(p.product?.name || p.customProduct, 120, yPosition)
          .text(p.quantity, 270, yPosition)
          .text(`€${p.product.price.toFixed(2)}`, 350, yPosition)
          .text(`€${totalPrice.toFixed(2)}`, 450, yPosition);

        yPosition += 20;
      });

      // ✅ Total Summary Section with Grey Background
      doc.fillColor("#F2F2F2").rect(300, yPosition, 260, 60).fill();
      doc
        .fillColor("black")
        .fontSize(10)
        .text(`SUBTOTAL: €${totalAmount.toFixed(2)}`, 310, yPosition + 5)
        .text(`TAX RATE: 0.00%`, 310, yPosition + 20)
        .text(`TOTAL: €${totalAmount.toFixed(2)}`, 310, yPosition + 35, {
          bold: true,
        });

      // ✅ Footer
      doc.moveDown(2);
      doc
        .fillColor("black")
        .fontSize(10)
        .text(`Authorized by: Marcos Carrillo`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown(1);
      doc.text(
        `If you have any questions regarding this purchase order, feel free to contact us.`
      );
      doc.text(`Email: purchases@marecomgroup.com || Phone: 656 36 19 05`);

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
