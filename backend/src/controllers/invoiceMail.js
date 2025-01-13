const PDFDocument = require('pdfkit');
const fs = require('fs');
const nodemailer = require('nodemailer');
const dbPool = require('../config/promise/promise_db.js');
const path = require('path');

const getUserEmail = async (userId) => {
    let connection;
    try {
        connection = await dbPool.getConnection();
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



exports.sendRefundEmail = async (userId, order_id,product_name, refund_date, refund_quantity, refund_price, refund_weight) => {
  try {
    const userEmail = await getUserEmail(userId); 
    console.log(`orderid: ${order_id}`);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'noreply.compresso@gmail.com', 
        pass:  'ezhnrpwiwzguzdfe', 
      },
    });
    
    const approve_title = `Refund Request Approved for Order #${order_id}`;

const emailTextHTML = `
  <p>Dear Customer,</p>

  <p>Thank you for reaching out to us regarding your recent refund request. We are pleased to inform you that your refund request for the product <strong>${product_name}</strong> has been <strong>approved</strong>.</p>

  <h3>Order Details:</h3>
  <ul>
    <li><strong>Order ID</strong>: ${order_id}</li>
    <li><strong>Refund Approved</strong>: ${refund_quantity} unit(s) of <strong>${product_name}</strong></li>
    <li><strong>Refund Amount</strong>: $${refund_price} (Total Refund Value)</li>
    <li><strong>Refund Weight</strong>: ${refund_weight} gram</li>
    <li><strong>Refund Request Date</strong>: ${refund_date}</li>
  </ul>

  <h3>Next Steps:</h3>
  <p>The approved refund amount of <strong>$${refund_price}</strong> will be processed and credited to your original payment method within 5 days. Please note that the exact time frame may vary depending on your bank or payment provider.</p>

  <p>We sincerely appreciate your patience and understanding throughout this process. If you have any questions or concerns, please feel free to contact us at <a href="mailto:noreply.compresso@gmail.com">noreply.compresso@gmail.com</a>.</p>

  <p>Thank you for choosing Compresso.</p>

  <p>Best regards,<br>
  <strong>Compresso Team</strong></p>
`;



    const mailOptions = {
      from: 'noreply.compresso@gmail.com',
      to: userEmail,
      subject:  approve_title,
      html: emailTextHTML, 
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending email:', err);
    throw err;
  }
};

exports.sendRejectEmail = async (userId, order_id, reject_reason, product_name, refund_date, refund_quantity, refund_price, refund_weight) => {
  try {
    const userEmail = await getUserEmail(userId); 
    console.log(`orderid: ${order_id}`);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'noreply.compresso@gmail.com', 
        pass:  'ezhnrpwiwzguzdfe', 
      },
    });
   
    const reject_title = `Refund Request Rejected for Order #${order_id}`


    const emailText = `
    Dear Customer,

    Thank you for reaching out to us regarding your recent refund request. After carefully reviewing your request, we regret to inform you that your refund request for the product **${product_name}** has been **rejected**.

    ### Order Details:
    - **Order ID**: ${order_id}
    - **Refund Requested**: ${refund_quantity} unit(s) of **${product_name}**
    - **Refund Amount**: $${refund_price} (Total Refund Value)
    - **Refund Weight**: ${refund_weight} gram
    - **Refund Request Date**: ${refund_date} 

    ### Reason for Rejection:
    Unfortunately, your refund request could not be processed at this time due to ${reject_reason}.

    We understand this may be disappointing, and we are committed to providing the best customer service possible. If you have any questions or would like to discuss the matter further, please don't hesitate to reach out to us at noreply.compresso@gmail.com .

    Thank you for your understanding.

    Best regards,  
    **Compresso Team**
  `;
  const emailTextHTML = `
  <p>Dear Customer,</p>

  <p>Thank you for reaching out to us regarding your recent refund request. After carefully reviewing your request, we regret to inform you that your refund request for the product <strong>${product_name}</strong> has been <strong>rejected</strong>.</p>

  <h3>Order Details:</h3>
  <ul>
    <li><strong>Order ID</strong>: ${order_id}</li>
    <li><strong>Refund Requested</strong>: ${refund_quantity} unit(s) of <strong>${product_name}</strong></li>
    <li><strong>Refund Amount</strong>: $${refund_price} (Total Refund Value)</li>
    <li><strong>Refund Weight</strong>: ${refund_weight} gram</li>
    <li><strong>Refund Request Date</strong>: ${refund_date}</li>
  </ul>

  <h3>Reason for Rejection:</h3>
  <p>Unfortunately, your refund request could not be processed at this time due to ${reject_reason}.</p>

  <p>We understand this may be disappointing, and we are committed to providing the best customer service possible. If you have any questions or would like to discuss the matter further, please don't hesitate to reach out to us at <a href="mailto:noreply.compresso@gmail.com">noreply.compresso@gmail.com</a>.</p>

  <p>Thank you for your understanding.</p>

  <p>Best regards,<br>
  <strong>Compresso Team</strong></p>
`;
  
    const mailOptions = {
      from: 'noreply.compresso@gmail.com',
      to: userEmail,
      subject: reject_title,
      html:  emailTextHTML, 
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending email:', err);
    throw err;
  }
};


exports.sendDiscountNotification = async (variantId, discountValue) => {
  let connection;
  try {
    connection = await dbPool.getConnection();

    // Get the product name based on the variantId
    const [productResult] = await connection.execute(
      `SELECT p.name AS product_name, pv.weight_grams
       FROM Products p
       JOIN Product_Variant pv ON p.product_id = pv.product_id
       WHERE pv.variant_id = ?`,
      [variantId]
    );

    if (productResult.length === 0) {
      console.log('No product found for variant ID: ${variantId}');
      return;
    }

    const { product_name: productName, weight_grams: weightGrams } = productResult[0];
    const displayWeight = weightGrams ? `${weightGrams}g` : '';

    // Get emails of users who have this variant in their wishlist
    const [users] = await connection.execute(
      `SELECT DISTINCT u.email, u.first_name
       FROM Users u
       INNER JOIN Wishlist w ON u.user_id = w.user_id
       INNER JOIN WishlistItems wi ON w.wishlist_id = wi.wishlist_id
       WHERE wi.variant_id = ?`,
      [variantId]
    );

    if (users.length === 0) {
      console.log(`No users have this product (variant ID: ${variantId}) in their wishlist.`);
      return;
    }

    // Set up the email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'noreply.compresso@gmail.com',
        pass: 'ezhnrpwiwzguzdfe',
      },
    });

    // Send emails to users
    for (const user of users) {
      const mailOptions = {
        from: 'noreply.compresso@gmail.com',
        to: user.email,
        subject: `☕ Enjoy ${discountValue}% Off ${productName} (${displayWeight}) This Week! 🎉`,
        html: `
          <h1 style="text-align: center;">Your Favorite Brew  ${productName} (${displayWeight}), Now at a Special Price! 🌟</h1>
          <p>Hi ${user.first_name},</p>
          <p>We’re excited to share some great news—our beloved <strong>${productName}</strong> coffee blend is now <strong>${discountValue}% off</strong> for a limited time! 🛍️</p>
          <p>Savor the rich, nutty flavors with every sip and make your coffee moments even more delightful. 😍</p>
          <p>⏳ <strong>Don’t miss out on this exclusive deal</strong>—stop by and grab your discounted bag of <strong>${productName} (${displayWeight})</strong> before it’s gone!</p>
          <p>Warm brews,</p>
          <p><strong>Compresso</strong><br>Your Coffee, Your Way</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Discount notification sent to ${user.email}`);
    }
  } catch (err) {
    console.error('Error sending discount notifications:', err);
    throw err;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
