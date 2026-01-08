const sgMail = require('@sendgrid/mail');

module.exports = async function (req, res) {
  try {
    const order = JSON.parse(req.payload);

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);


    const msg = {
      to: 'abdeallahdz2004@gmail.com', // your email
      from: 'abdellah.becherair@gmail.com',     // verified sender in SendGrid
      subject: `New Order #${order.$id}`,
      html: `
        <h2>New Order Details</h2>
        <p><strong>Customer:</strong> ${order.fullname}</p>
        <p><strong>phone:</strong> ${order.phone}</p>
        <p><strong>Total:</strong> ${order.total_price}</p>
      `
    };

    await sgMail.send(msg);
    res.send('Order email sent successfully!');
  } catch (error) {
    console.error(error);
    res.json({ error: error.message });
  }
};
