


// const PDFDocument = require("pdfkit");
// const fs = require("fs");

// const generatePurchaseOrderPDF = (order, filePath) => {
//   return new Promise((resolve, reject) => {
//     const doc = new PDFDocument({ margin: 40 });

//     try {
//       const stream = fs.createWriteStream(filePath);
//       doc.pipe(stream);

//       // ✅ Add Company Logo (Properly Positioned)
//       const logoPath = "./public/Logo.png"; // Update with actual path
//       if (fs.existsSync(logoPath)) {
//         doc.image(logoPath, 440, 40, { width: 100 });
//       }

//       // ✅ Header - Company Name and Order Info
//       doc.fillColor("#004080").font("Helvetica-Bold").fontSize(24)
//         .text("MARECOM ONSIDE COOP. V.", 50, 40);

//       doc.fillColor("black").fontSize(12)
//         .text(`NIF: F72985682\nC/ Benito Pérez Galdos 17C, Pinoso, Alicante, 03650\nPhone: 656 36 19 05\nEmail: info@marecomgroup.com`, 50, 75);

//       doc.fillColor("black").fontSize(12)
//         .text(`DATE: ${new Date().toLocaleDateString()}`, 400, 90, { align: "right" })
//         .text(`P.O. #: ${order.orderNumber || "N/A"}`, 400, 110, { align: "right" });

//       // ✅ Vendor and Ship-To Sections (Aligned Properly)
//       const sectionTop = 160;
//       doc.fillColor("#004080").fontSize(12).text("VENDOR / PROVEEDOR", 50, sectionTop);
//       doc.fillColor("#004080").fontSize(12).text("SHIP TO / ENVIAR A:", 350, sectionTop);

//       const textSpacing = sectionTop + 15;

//       doc.fillColor("black").fontSize(10)
//         .text(order.supplier?.name || order.customSupplier, 50, textSpacing)
//         .text(`NIF: ${order.supplier?.nif || "N/A"}`, 50, textSpacing + 15)
//         .text(`Address: ${order.supplier?.address || "N/A"}`, 50, textSpacing + 30)
//         .text(`Phone: ${order.supplier?.phone || "N/A"}`, 50, textSpacing + 45);

//       doc.fillColor("black").fontSize(10)
//         .text("Marecom Onside Coop. V.", 350, textSpacing)
//         .text("NIF: F72985682", 350, textSpacing + 15)
//         .text("Plantillas El Cabezo, Pol. Ind. Calle Nueve, Pinoso, Alicante, 03650", 350, textSpacing + 30);

//       // ✅ Table Header
//       const tableTop = textSpacing + 70;
//       doc.fillColor("#004080").rect(40, tableTop, 520, 25).fill();
//       doc.fillColor("white").fontSize(11).font("Helvetica-Bold")
//         .text("S. No.", 50, tableTop + 7)
//         .text("ITEM #", 100, tableTop + 7)
//         .text("DESCRIPTION", 180, tableTop + 7)
//         .text("QTY", 330, tableTop + 7)
//         .text("UNIT PRICE", 410, tableTop + 7)
//         .text("TOTAL", 500, tableTop + 7);

//       let totalAmount = 0;
//       let yPosition = tableTop + 35;

//       // ✅ Populate Products (Alternating Row Colors)
//       order.products.forEach((p, index) => {
//         const totalPrice = p.product.price * p.quantity;
//         totalAmount += totalPrice;

//         if (index % 2 === 0) {
//           doc.fillColor("#F2F2F2").rect(40, yPosition - 5, 520, 20).fill();
//         }
//         doc.fillColor("black").font("Helvetica");

//         doc.fontSize(10)
//           .text(index + 1, 50, yPosition)
//           .text(p.product?.manufacturerReference || "N/A", 100, yPosition)
//           .text(p.product?.name || p.customProduct, 180, yPosition)
//           .text(p.quantity, 330, yPosition)
//           .text(`€${p.product.price.toFixed(2)}`, 410, yPosition)
//           .text(`€${totalPrice.toFixed(2)}`, 500, yPosition);

//         yPosition += 20;
//       });

//       // ✅ Subtotal & Summary Box (Professional Layout)
//       doc.fillColor("#E0E0E0").rect(300, yPosition + 10, 260, 80).fill();
//       doc.fillColor("black").fontSize(11)
//         .text("SUBTOTAL:", 310, yPosition + 15)
//         .text("TAX RATE:", 310, yPosition + 35)
//         .text("TOTAL:", 310, yPosition + 55, { bold: true });

//       doc.fillColor("black").fontSize(11)
//         .text(`€${totalAmount.toFixed(2)}`, 460, yPosition + 15, { align: "right" })
//         .text(`0.00%`, 460, yPosition + 35, { align: "right" })
//         .text(`€${totalAmount.toFixed(2)}`, 460, yPosition + 55, { align: "right", bold: true });

//       yPosition += 100;

//       // ✅ Other Comments or Special Instructions Section (Optimized Spacing)
//       doc.fillColor("#004080").fontSize(12).text("Other Comments or Special Instructions", 50, yPosition);
//       doc.fillColor("black").fontSize(10)
//         .text("NO DISPONEMOS DE CARRETILLA TORITO MECANICO PARA LA DESCARGA", 50, yPosition + 15);

//       yPosition += 30; // Less space before footer


//       doc.fillColor("red").fontSize(10);
//       doc.text(
//         "If you have any questions regarding this purchase order, feel free to contact us.",
//         50,
//         yPosition + 80,
//         { align: "center" }
//       )
//         .text(
//           "info@marecomgroup.com || purchases@marecomgroup.com || +34 656 36 19 05",
//           50,
//           yPosition + 95,
//           { align: "center" }
//         );

//       doc.end();

//       stream.on("finish", () => {
//         console.log(`✅ PDF file created: ${filePath}`);
//         resolve(filePath);
//       });

//       stream.on("error", (err) => reject(err));
//     } catch (error) {
//       console.error("❌ Error generating PDF:", error);
//       reject(error);
//     }
//   });
// };

// module.exports = { generatePurchaseOrderPDF };
const PDFDocument = require("pdfkit");
const fs = require("fs");

const generatePurchaseOrderPDF = (order, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });

    try {
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ✅ Add Company Logo (Properly Positioned)
      const logoPath = "./public/Logo.png"; // Update with actual path
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 440, 40, { width: 100 });
      }

      // ✅ Header - Company Name and Order Info
      doc.fillColor("#004080").font("Helvetica-Bold").fontSize(24)
        .text("MARECOM ONSIDE COOP. V.", 50, 40);

      doc.fillColor("black").fontSize(12)
        .text(`NIF: F72985682\nC/ Benito Pérez Galdos 17C, Pinoso, Alicante, 03650\nPhone: 656 36 19 05\nEmail: info@marecomgroup.com`, 50, 75);

      doc.fillColor("black").fontSize(12)
        .text(`DATE: ${new Date().toLocaleDateString()}`, 400, 90, { align: "right" })
        .text(`P.O. #: ${order.orderNumber || "N/A"}`, 400, 110, { align: "right" });

      // ✅ Vendor and Ship-To Sections (Aligned Properly)
      const sectionTop = 160;
      doc.fillColor("#004080").fontSize(12).text("VENDOR / PROVEEDOR", 50, sectionTop);
      doc.fillColor("#004080").fontSize(12).text("SHIP TO / ENVIAR A:", 350, sectionTop);

      const textSpacing = sectionTop + 15;

      doc.fillColor("black").fontSize(10)
        .text(order.supplier?.name || order.customSupplier, 50, textSpacing)
        .text(`NIF: ${order.supplier?.nif || "N/A"}`, 50, textSpacing + 15)
        .text(`Address: ${order.supplier?.address || "N/A"}`, 50, textSpacing + 30)
        .text(`Phone: ${order.supplier?.phone || "N/A"}`, 50, textSpacing + 45);

      doc.fillColor("black").fontSize(10)
        .text("Marecom Onside Coop. V.", 350, textSpacing)
        .text("NIF: F72985682", 350, textSpacing + 15)
        .text("Plantillas El Cabezo, Pol. Ind. Calle Nueve, Pinoso, Alicante, 03650", 350, textSpacing + 30);

      // ✅ Table Header
      const tableTop = textSpacing + 70;
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

      // ✅ Populate Products (Alternating Row Colors)
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

      // ✅ Subtotal & Summary Box (Ensured Values Stay Inside)
      const boxTop = yPosition + 10;
      doc.fillColor("#E0E0E0").rect(300, boxTop, 240, 70).fill();
      doc.fillColor("black").fontSize(11);

      doc.text("SUBTOTAL   :", 310, boxTop + 10);
      doc.text("TAX RATE    :", 310, boxTop + 30);
      doc.text("TOTAL          :", 310, boxTop + 50, { bold: true });

      // Ensuring values remain inside the box
      doc.text(`€ ${totalAmount.toFixed(2)}`, 430, boxTop + 10);
      doc.text(`0.00%`, 430, boxTop + 30);
      doc.text(`€ ${totalAmount.toFixed(2)}`, 430, boxTop + 50, { bold: true });

      yPosition = boxTop + 90;

      // ✅ Other Comments or Special Instructions Section (Optimized Spacing)
      doc.fillColor("#004080").fontSize(12).text("Other Comments or Special Instructions", 50, yPosition);
      doc.fillColor("black").fontSize(10)
        .text("NO DISPONEMOS DE CARRETILLA TORITO MECANICO PARA LA DESCARGA", 50, yPosition + 15);

      yPosition += 30; // Reduced space before contact info

      // ✅ Contact Info (Optimized Spacing)
      doc.fillColor("red").fontSize(10);
      doc.text(
        "If you have any questions regarding this purchase order, feel free to contact us.",
        50,
        yPosition + 30,
        { align: "center" }
      )
        .text(
          "info@marecomgroup.com || purchases@marecomgroup.com || +34 656 36 19 05",
          50,
          yPosition + 45,
          { align: "center" }
        );

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
