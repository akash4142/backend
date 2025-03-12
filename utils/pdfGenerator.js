const PDFDocument = require("pdfkit");
const fs = require("fs");

const generatePurchaseOrderPDF = (order, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });

    try {
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ✅ Add Company Logo (Optional: Replace with actual logo path)
      const logoPath = "./public/Logo.png"; // Update with actual path
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 440, 40, { width: 100 });
      }
     

      // ✅ Header - Company Title and Order Info
      doc.fillColor("#004080").font("Helvetica-Bold").fontSize(24)
        .text("MARECOM ONSIDE COOP. V.", 50, 40, { align: "left" });
      
      doc.fillColor("black").fontSize(12)
        .text(`NIF: F72985682\nC/ Benito Pérez Galdos 17C, Pinoso, Alicante, 03650\nPhone: 656 36 19 05\nEmail: info@marecomgroup.com`, 50, 80);
      
      doc.fillColor("#004080").fontSize(16).text("HOJA DE PEDIDO", 380, 80, { align: "right" });
      doc.fillColor("black").fontSize(12)
        .text(`DATE: ${new Date().toLocaleDateString()}`, 400, 100, { align: "right" })
        .text(`P.O. #: ${order.orderNumber || "N/A"}`, 400, 110, { align: "right" });
      
      doc.moveDown(2);

      // ✅ Vendor and Ship To Sections (Reversed as per images)
      doc.fillColor("#004080").fontSize(12).text("VENDOR / PROVEEDOR", 50, 140);
      doc.fillColor("black").fontSize(10)
        .text(order.supplier?.name || order.customSupplier, 50, 155)
        .text(`NIF: ${order.supplier?.nif || "N/A"}`, 50)
        .text(`Address: ${order.supplier?.address || "N/A"}`, 50)
        .text(`Phone: ${order.supplier?.phone || "N/A"}`, 50);
      
      doc.fillColor("#004080").fontSize(12).text("SHIP TO / ENVIAR A:", 350, 140);
      doc.fillColor("black").fontSize(10)
        .text("Marecom Onside Coop. V.", 350, 155)
        .text("NIF: F72985682", 350)
        .text("Plantillas El Cabezo, Pol. Ind. Calle Nueve, Pinoso, Alicante, 03650", 350);

      doc.moveDown(2);

      // ✅ Table Header
      const tableTop = 220;
      doc.fillColor("#004080").rect(40, tableTop, 520, 25).fill();
      doc.fillColor("white").fontSize(11).font("Helvetica-Bold")
        .text("S. No.", 50, tableTop + 7)
        .text("ITEM #", 100, tableTop + 7)
        .text("DESCRIPTION", 180, tableTop + 7)
        .text("QTY", 330, tableTop + 7)
        .text("UNIT PRICE", 410, tableTop + 7)
        .text("TOTAL", 500, tableTop + 7);

      let totalAmount = 0;
      let yPosition = tableTop + 35;

      // ✅ Populate Products
      order.products.forEach((p, index) => {
        const totalPrice = p.product.price * p.quantity;
        totalAmount += totalPrice;

        if (index % 2 === 0) {
          doc.fillColor("#F2F2F2").rect(40, yPosition - 5, 520, 20).fill();
        }
        doc.fillColor("black").font("Helvetica");

        doc.fontSize(10)
          .text(index + 1, 50, yPosition)
          .text(p.product?.manufacturerReference || "N/A", 100, yPosition)
          .text(p.product?.name || p.customProduct, 180, yPosition)
          .text(p.quantity, 330, yPosition)
          .text(`€${p.product.price.toFixed(2)}`, 410, yPosition)
          .text(`€${totalPrice.toFixed(2)}`, 500, yPosition);

        yPosition += 20;
      });

      // ✅ Subtotal & Summary Box
      doc.fillColor("#E0E0E0").rect(300, yPosition + 10, 260, 80).fill();
      doc.fillColor("black").fontSize(11)
        .text(`SUBTOTAL: €${totalAmount.toFixed(2)}`, 310, yPosition + 15)
        .text(`TAX RATE: 0.00%`, 310, yPosition + 35)
        .text(`TOTAL: €${totalAmount.toFixed(2)}`, 310, yPosition + 55, { bold: true });
      
      yPosition += 100;

      // ✅ Other Comments or Special Instructions Section
      doc.fillColor("#004080").fontSize(12).text("Other Comments or Special Instructions", 50, yPosition);
      doc.fillColor("black").fontSize(10).text("NO DISPONEMOS DE CARRETILLA TORITO MECANICO PARA LA DESCARGA", 50, yPosition + 15);
      doc.text("SEGUIMOS CON LA MISMA ETIQUETA QUE LA ÚLTIMA VEZ QUE ERA BUENA LA RESOLUCIÓN", 50, yPosition + 30);

      yPosition += 50;

      // ✅ Footer with Contact Info
      doc.text("Marecom Onside Coop. V.", 50, yPosition + 30);
      doc.text("Authorized by: Pablo Carrillo", 50, yPosition + 45);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, yPosition + 60);
      
      doc.fillColor("red").fontSize(10)
        .text("If you have any questions regarding this purchase order, feel free to contact us.", 50, yPosition + 80)
        .text("info@marecomgroup.com || purchases@marecomgroup.com || +34 656 36 19 05", 50, yPosition + 95);
      
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
