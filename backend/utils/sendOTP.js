const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// Send OTP
async function sendOTP(email, otp) {
    if (!email) {
        throw new Error("OTP recipient email is missing");
    }

    console.log("Sending OTP to:", email);

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Dealer Login OTP",
        html: `
            <div style="font-family: Arial, sans-serif; text-align: center;">
                <h2>Dealer Login Verification</h2>
                <p>Your OTP is:</p>
                <div style="
                    font-size: 28px;
                    font-family: Arial, sans-serif;
                    text-align: center;
                    width: 140px;
                    background-color: #eef5ff;
                    color: #1f4e79;
                    border: 2px solid #6c9bd2;
                    border-radius: 4px;
                    letter-spacing: 4px;
                    margin: auto;
                    padding: 12px 0;
                ">
                    ${otp}
                </div>
                <p>This OTP is required to login to your dealer account.</p>
            </div>
        `
    });

    console.log("OTP email sent successfully");
}


// Send dealer approval email
async function sendApprovalEmail(email, name) {
    if (!email) {
        throw new Error("Approval recipient email is missing");
    }

    console.log("Sending approval email to:", email);

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Dealer Account Approved",
        html: `
            <div style="font-family: Arial, sans-serif; text-align: center;">
                <h2>Dealer Account Approved</h2>
                <p>Hello ${name},</p>
                <p>Your dealer account has been approved successfully.</p>
                <div style="
                    font-size: 20px;
                    font-family: Arial, sans-serif;
                    text-align: center;
                    width: 220px;
                    background-color: #eef5ff;
                    color: #1f4e79;
                    border: 2px solid #6c9bd2;
                    border-radius: 4px;
                    margin: auto;
                    padding: 12px 0;
                ">
                    Account Approved
                </div>
                <p>You can now login to your dealer account.</p>
            </div>
        `
    });

    console.log("Approval email sent successfully");
}

// 1. Admin Adds Product -> Email ALL Registered Dealers
async function sendProductAddedEmail(email, product) {
    if (!email) return;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: `New Product Added: ${product.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #1f4e79;">📢 New Product Available in Catalog!</h2>
                    <p>Dear Dealer,</p>
                    <p>A new product has been added to our catalog. Here are the details:</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Product Name:</td><td style="padding: 8px; border: 1px solid #ddd;">${product.name}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Product ID:</td><td style="padding: 8px; border: 1px solid #ddd;">${product._id}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Category:</td><td style="padding: 8px; border: 1px solid #ddd;">${product.category} (${product.subcategory || 'N/A'})</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Price:</td><td style="padding: 8px; border: 1px solid #ddd;">₹${product.price}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Stock Available:</td><td style="padding: 8px; border: 1px solid #ddd;">${product.stock} units</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Description:</td><td style="padding: 8px; border: 1px solid #ddd;">${product.description}</td></tr>
                    </table>
                    <p style="margin-top: 20px;">Log in to your account now to place your order.</p>
                </div>
            `
        });
        console.log(`Product email sent to ${email}`);
    } catch (err) {
        console.log(`Failed sending product email to ${email}:`, err.message);
    }
}

// 2. Order Approved Email to Dealer
async function sendOrderApprovedEmail(email, details) {
    if (!email) return;

    const itemsHtml = (details.items || []).map(item => `
        <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.productName}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${item.price}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${item.price * item.quantity}</td>
        </tr>
    `).join("");

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Order Approved: #${details.orderId.substring(details.orderId.length - 8)}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #16a34a;">Your order has been approved/accepted.</h2>
                    <p>Dear ${details.dealerName},</p>
                    <p>Great news! Your order request has been reviewed and <strong>APPROVED</strong> by the admin team.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;" />
                    <p><strong>Order ID:</strong> #${details.orderId}</p>
                    <p><strong>Order Date:</strong> ${details.orderDate}</p>
                    <p><strong>Approval Date:</strong> ${details.approvalDate}</p>
                    <h3>Order Summary</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f8fafc;">
                                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Product</th>
                                <th style="padding: 8px; border: 1px solid #ddd;">Qty</th>
                                <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Price</th>
                                <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    <p style="font-size: 18px; font-weight: bold; margin-top: 15px;">Total Amount: ₹${details.totalAmount}</p>
                </div>
            `
        });
        console.log(`Order approval email sent to ${email}`);
    } catch (err) {
        console.log(`Failed sending order approval email to ${email}:`, err.message);
    }
}

// 3. Shipment Created Email to Dealer
async function sendShipmentCreatedEmail(email, details) {
    if (!email) return;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Shipment Dispatched: Order #${details.orderId.substring(details.orderId.length - 8)}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #1f4e79;">🚚 Shipment Information Update</h2>
                    <p>Dear ${details.dealerName},</p>
                    <p>A shipment has been created for your approved order.</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Order ID:</td><td style="padding: 8px; border: 1px solid #ddd;">#${details.orderId}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Shipment ID:</td><td style="padding: 8px; border: 1px solid #ddd;">${details.shipmentId}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Courier / Transport Name:</td><td style="padding: 8px; border: 1px solid #ddd;">${details.transportName}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Vehicle Number:</td><td style="padding: 8px; border: 1px solid #ddd;">${details.vehicleNumber}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Driver Name:</td><td style="padding: 8px; border: 1px solid #ddd;">${details.driverName}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Dispatch Date:</td><td style="padding: 8px; border: 1px solid #ddd;">${details.dispatchDate}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Expected Delivery Date:</td><td style="padding: 8px; border: 1px solid #ddd;">${details.expectedDate}</td></tr>
                    </table>
                </div>
            `
        });
        console.log(`Shipment creation email sent to ${email}`);
    } catch (err) {
        console.log(`Failed sending shipment creation email to ${email}:`, err.message);
    }
}

// 4. Shipment Delivered Email to Dealer
async function sendShipmentDeliveredEmail(email, details) {
    if (!email) return;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Order Delivered Successfully: Order #${details.orderId.substring(details.orderId.length - 8)}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #16a34a;">Order delivered successfully.</h2>
                    <p>Dear ${details.dealerName},</p>
                    <p>Your order shipment has been marked as <strong>DELIVERED</strong>.</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Order ID:</td><td style="padding: 8px; border: 1px solid #ddd;">#${details.orderId}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Shipment ID:</td><td style="padding: 8px; border: 1px solid #ddd;">${details.shipmentId}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Delivery Date:</td><td style="padding: 8px; border: 1px solid #ddd;">${details.deliveryDate}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Total Amount:</td><td style="padding: 8px; border: 1px solid #ddd;">₹${details.totalAmount}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Status:</td><td style="padding: 8px; border: 1px solid #ddd; color: #16a34a; font-weight: bold;">Delivered</td></tr>
                    </table>
                    <p style="margin-top: 15px;">Thank you for conducting business with us!</p>
                </div>
            `
        });
        console.log(`Shipment delivery email sent to ${email}`);
    } catch (err) {
        console.log(`Failed sending shipment delivery email to ${email}:`, err.message);
    }
}

// 5. Payment Approved Email to Dealer
async function sendPaymentApprovedEmail(email, details) {
    if (!email) return;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Payment Verified & Approved for Order #${details.orderId.substring(details.orderId.length - 8)}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #16a34a;">Payment Verified Successfully</h2>
                    <p>Dear ${details.dealerName},</p>
                    <p>Your payment submission has been verified and approved by the admin team.</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Order ID:</td><td style="padding: 8px; border: 1px solid #ddd;">#${details.orderId}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Payment Method:</td><td style="padding: 8px; border: 1px solid #ddd;">${details.paymentMethod}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Amount Paid:</td><td style="padding: 8px; border: 1px solid #ddd;">₹${details.amount}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Transaction ID / UTR:</td><td style="padding: 8px; border: 1px solid #ddd;">${details.transactionId || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Status:</td><td style="padding: 8px; border: 1px solid #ddd; color: #16a34a; font-weight: bold;">Approved / Paid</td></tr>
                    </table>
                </div>
            `
        });
        console.log(`Payment approval email sent to ${email}`);
    } catch (err) {
        console.log(`Failed sending payment approval email to ${email}:`, err.message);
    }
}

// 6. Payment Rejected Email to Dealer
async function sendPaymentRejectedEmail(email, details) {
    if (!email) return;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Payment Verification Failed for Order #${details.orderId.substring(details.orderId.length - 8)}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #dc2626;">Payment Verification Failed</h2>
                    <p>Dear ${details.dealerName},</p>
                    <p>We could not verify your submitted payment details for order #${details.orderId}.</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Order ID:</td><td style="padding: 8px; border: 1px solid #ddd;">#${details.orderId}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Amount:</td><td style="padding: 8px; border: 1px solid #ddd;">₹${details.amount}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Transaction ID / UTR:</td><td style="padding: 8px; border: 1px solid #ddd;">${details.transactionId || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Status:</td><td style="padding: 8px; border: 1px solid #ddd; color: #dc2626; font-weight: bold;">Rejected</td></tr>
                    </table>
                    <p style="margin-top: 15px;">Please verify your UTR / payment receipt and re-submit or contact admin support.</p>
                </div>
            `
        });
        console.log(`Payment rejection email sent to ${email}`);
    } catch (err) {
        console.log(`Failed sending payment rejection email to ${email}:`, err.message);
    }
}


module.exports = sendOTP;
module.exports.sendApprovalEmail = sendApprovalEmail;
module.exports.sendProductAddedEmail = sendProductAddedEmail;
module.exports.sendOrderApprovedEmail = sendOrderApprovedEmail;
module.exports.sendShipmentCreatedEmail = sendShipmentCreatedEmail;
module.exports.sendShipmentDeliveredEmail = sendShipmentDeliveredEmail;
module.exports.sendPaymentApprovedEmail = sendPaymentApprovedEmail;
module.exports.sendPaymentRejectedEmail = sendPaymentRejectedEmail;