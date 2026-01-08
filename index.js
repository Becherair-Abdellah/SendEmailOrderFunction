const sgMail = require('@sendgrid/mail');

module.exports = async function (req, res) {
  try {
    const order = JSON.parse(req.payload);

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: 'your-email@example.com', // your email
      from: 'store@example.com',     // verified sender in SendGrid
      subject: `New Order #${order.$id}`,
      html: `
        <h2>New Order Details</h2>
        <p><strong>Customer:</strong> ${order.customerName}</p>
        <p><strong>Email:</strong> ${order.customerEmail}</p>
        <p><strong>Total:</strong> ${order.total}</p>
        <p><strong>Products:</strong> ${JSON.stringify(order.products)}</p>
      `
    };

    await sgMail.send(msg);
    res.send('Order email sent successfully!');
  } catch (error) {
    console.error(error);
    res.json({ error: error.message });
  }
};
