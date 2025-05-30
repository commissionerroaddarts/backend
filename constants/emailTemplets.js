export const WELCOME = (email, firstname) => {
    const data = {
        subject: "Welcome to Road Darts",
        recipient: email,
        html: `
            <h1>Welcome to Road Darts!</h1>
            <p>Dear ${firstname},</p>
            <p>We're thrilled to welcome you to the Road Darts family!</p>
            <p>Partnering with us is more than just a listing—it's a shared journey to drive foot traffic, boost your revenue, and build a thriving partnership where we succeed together.</p>
            <p><a href="https://roaddarts.com" target="_blank">RoadDarts.com</a> is also a growing social hub for darters—connecting players, sharing tips, and promoting venues just like yours. By joining, you're not just getting exposure—you're becoming part of a vibrant community of dart enthusiasts across the country.</p>
            <p>Whether you need help promoting upcoming events or growing your local following, we're here to support you every step of the way.</p>
            <p>Thank you for trusting us—let's make something amazing happen!</p>
            <p>Best regards,</p>
            <p>The Road Darts Team</p>
            <a href="${process.env.FRONTEND_URL}" class="button">Get Started</a>
            `
    }
    return data
};

export const NEW_USER_SIGNUP = (email, firstname) => {
    const data = {
        subject: "New User Signup on Road Darts",
        recipient: process.env.ADMIN_EMAIL,
        html: `
            <h1>New User Registered</h1>
            <p>A new user has just signed up on <a href="https://roaddarts.com" target="_blank">RoadDarts.com</a>.</p>
            <p><strong>First Name:</strong> ${firstname}</p>
            <p><strong>Email Address:</strong> ${email}</p>
            <p>Road Darts Notification System</p>
        `
    };
    return data;
};



export const REVIEW_NOTIFICATION = (email, businessName, link) => {
    return {
        subject: `New Review on Your Business - Road Dart Stories`,
        recipient: email,
        html: `
        <h1>New Review Added</h1>
        <p>Hi,</p>
        <p>You just received a new review on your business <strong>${businessName}</strong>.</p>
        <p>Click the link below to check it out.</p>
        <a href="${link}" class="button">View Review</a>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br/>The Road Darts Team</p>
    `
    };
};



export const OTP = (email, firstname, token) => {
    const data = {
        subject: "Email Verification - Road Dart Stories",
        recipient: email,
        html: `
            <h1>Email Verification</h1>
            <p>Dear ${firstname},</p>
            <p>Thank you for signing up with Road Dart Stories. To complete your verification, please click the link below:</p>
            <p>This link will expire in 24 hours.</p>
            <a href="${process.env.BACKEND_URL}/api/auth/verify?token=${token}" class="button">Verify Account</a>
            <p>If you did not request this, please ignore this email or contact our support team for assistance.</p>
            <p>Best regards,</p>
            <p>The Road Darts Team</p>
            `
    };
    return data
};

export const CONTACT_US = ({ firstname, lastname, email, phone, message }) => {
    const data = {
        subject: `New Contact Form Submission from ${firstname} ${lastname}`,
        recipient: process.env.ADMIN_EMAIL,
        html: `
            <h1>New Contact Form Submission</h1>
            <p>You have received a new message from the contact form on Road Dart Stories.</p>
            <hr />
            <p><strong>Contact Details</strong></p>
            <p><strong>Full Name:</strong> ${firstname} ${lastname}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Message:</strong> ${message}</p>
            <hr />
            <p>Best regards,<br />Road Dart Stories Notification System</p>
        `
    };
    return data;
};


export const THANKS_FOR_CONTACTING = ({ email, firstname }) => {
    const data = {
        subject: "Thanks for Contacting Road Dart Stories",
        recipient: email,
        html: `
            <h1>Thank You for Reaching Out!</h1>
            <p>Hi ${firstname},</p>
            <p>We’ve received your message and our team will get back to you as soon as possible. We appreciate you taking the time to connect with us.</p>
            <p>In the meantime, feel free to explore our platform and learn more about how Road Dart Stories can help you connect, collaborate, and grow.</p>
            <p>If your inquiry is urgent, don’t hesitate to reply to this email directly or contact us at <a href="mailto:support@roaddartstories.com">support@roaddartstories.com</a>.</p>
            <p>Thanks again — we’ll be in touch soon!</p>
            <p>Best regards,<br />The Road Darts Team</p>
            <a href="${process.env.FRONTEND_URL}" class="button">Visit Our Website</a>
        `
    };
    return data;
};

export const ForgotPasswordEmail = (email, token) => {
    const data = {
        subject: "Password Reset Request - Road Darts",
        recipient: email,
        html: `
            <h1>Password Reset Request</h1>
            <p>Hello,</p>
            <p>We received a request to reset the password associated with this email address (${email}).</p>
            <p>If you made this request, click the link below to set a new password. This link will expire in 1 hour for your security.</p>
            <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}" class="button">Reset Password</a>
            <p>If you didn't request a password reset, please ignore this email or let us know immediately.</p>
            <p>Best regards,</p>
            <p>The Road Dart Stories Team</p>
        `
    };
    return data;
};




