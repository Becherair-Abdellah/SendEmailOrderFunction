const sgMail = require('@sendgrid/mail');

module.exports = async ({ req, res, log, error }) => {
  try {
    // When triggered by Appwrite database event, data is in req.body
    // The structure is: { event: 'databases.documents.create', data: {...} }
    
    log('Full request body:');
    log(JSON.stringify(req.body, null, 2));
    
    // Extract order data from Appwrite event
    let order;
    
    if (req.body && req.body.data) {
      // This is an Appwrite database event
      order = req.body.data;
      log('Order data from database event:');
    } else if (req.body) {
      // Direct API call (testing)
      order = req.body;
      log('Order data from direct API call:');
    } else {
      throw new Error('No data received in request');
    }
    
    log(JSON.stringify(order, null, 2));
    
    // Validate required fields
    if (!order.$id || !order.fullname || !order.phone || !order.total_price) {
      error('Missing required order fields in: ' + JSON.stringify(order));
      return res.json({
        success: false,
        error: 'Missing required order fields',
        receivedData: order
      }, 400);
    }
    
    // Set SendGrid API key
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY environment variable is not set');
    }
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    // Format the email
    const msg = {
      to: 'abdeallahdz2004@gmail.com',
      from: 'abdellah.becherair@gmail.com',
      subject: `🎉 New Order Received - #${order.$id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New Order Notification</h1>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff;">
            <h2 style="margin-top: 0;">Order Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;"><strong>Order ID:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${order.$id}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;"><strong>Customer Name:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${order.fullname}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;"><strong>Phone:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${order.phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;"><strong>Address:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${order.address || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;"><strong>Total Price:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">$${parseFloat(order.total_price).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;"><strong>Status:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${order.order_status || 'pending'}</td>
              </tr>
              <tr>
                <td style="padding: 8px;"><strong>Order Date:</strong></td>
                <td style="padding: 8px;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </div>
          <p style="color: #666; margin-top: 20px;">
            This email was automatically sent from your application when a new order was created.
          </p>
        </div>
      `
    };
    
    // Send email
    await sgMail.send(msg);
    log(`✅ Email sent successfully for order: ${order.$id}`);
    
    return res.json({
      success: true,
      message: 'Order confirmation email sent successfully!',
      orderId: order.$id,
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    error('❌ Failed to send email: ' + err.message);
    error('Error stack: ' + err.stack);
    
    return res.json({
      success: false,
      error: err.message,
      tip: 'Check SENDGRID_API_KEY environment variable and email configuration'
    }, 500);
  }
};