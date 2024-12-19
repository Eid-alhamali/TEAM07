const PDFDocument = require('pdfkit');
const fs = require('fs');
const nodemailer = require('nodemailer');
const checkoutPool = require('../config/promise/promise_db.js');
const path = require('path');

checkoutPool.getConnection()
    .then(connection => {
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to Checkout MySQL pool:', err);
    });

const getUserEmail = async (userId) => {
    let connection;
    try {
        connection = await checkoutPool.getConnection();
        const [result] = await connection.execute('SELECT email FROM Users WHERE user_id = ?', [userId]);
        
        if (result.length === 0) {
            throw new Error(`No user found with user_id ${userId}`);
        }
        
        return result[0].email;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};



exports.generateInvoicePdf = (orderId, cart, address, totalPrice) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const tmpDir = path.join(__dirname, '../tmp');

      // Ensure the tmp directory exists
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      const filePath = path.join(tmpDir, `invoice_${orderId}.pdf`);
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      // Add content to the PDF
      const logoPath = path.join(__dirname, '../assets/images/logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 250, 50, { width: 100 });
      } else {
        console.warn(`Logo image not found at path: ${logoPath}`);
      }

      doc.translate(0, 50);
      doc.fontSize(20).text('Invoice', { align: 'center' }).moveDown();

      doc.moveTo(50, 105).lineTo(550, 105).stroke();

      doc.fontSize(12).text(`Order ID: ${orderId}`, { align: 'left' }).moveDown(0.5);
      doc.text(`Full Name: ${address.firstname} ${address.lastname}`);
      doc.text(`Country: ${address.country}`);
      doc.text(`City: ${address.city}`);
      doc.text(`Zipcode: ${address.zipcode}`);
      doc.text(`Total Price: ${totalPrice.toFixed(2)} TL`).moveDown();

      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown();

      doc.fontSize(12).font('Helvetica-Bold');
      const tableTop = doc.y;

      doc.text('Item', 50, tableTop, { width: 200 });
      doc.text('Quantity', 250, tableTop, { width: 100, align: 'center' });
      doc.text('Price', 350, tableTop, { width: 100, align: 'center' });
      doc.text('Total', 400, tableTop, { width: 200, align: 'center' });
      doc.moveDown();

      cart.forEach((item) => {
        const lineTop = doc.y;
        const lineTotal = parseFloat(item.price) * parseInt(item.quantity, 10);
        doc.font('Helvetica');
        doc.text(item.product_name, 50, lineTop, { width: 200 });
        doc.text(item.quantity.toString(), 250, lineTop, { width: 100, align: 'center' });
        doc.text(`${parseFloat(item.price).toFixed(2)} TL`, 350, lineTop, { width: 100, align: 'center' });
        doc.text(`${lineTotal.toFixed(2)} TL`, 450, lineTop, { width: 100, align: 'center' });
        doc.moveDown();
      });

      doc.moveDown(2).font('Helvetica-Bold').fontSize(14);
      doc.text(`Total: ${totalPrice.toFixed(2)} TL`, 400, doc.y, { align: 'center' });

      doc.end();

      writeStream.on('finish', () => {
        resolve(filePath);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};









exports.sendInvoiceEmail = async (userId, pdfPath) => {
  try {
    const userEmail = await getUserEmail(userId); 

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'noreply.compresso@gmail.com', 
        pass:  'ezhnrpwiwzguzdfe', 
      },
    });

    const mailOptions = {
      from: 'noreply.compresso@gmail.com',
      to: userEmail,
      subject: 'Your Invoice',
      text: 'Thank you for your purchase! Please find your invoice attached.',
      attachments: [
        {
          filename: `invoice_${userId}.pdf`,
          path: pdfPath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending email:', err);
    throw err;
  }
};

