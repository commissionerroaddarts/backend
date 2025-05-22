export const WELCOME = (email, firstname) => {
    const data = {
        subject: "Welcome to Road Dart Stories",
        recipient: email,
        html: `
            <h1>Welcome to Road Dart Stories!</h1>
            <p>Dear ${firstname},</p>
            <p>We're thrilled to have you join the Road Darts community — where opportunity meets innovation. Our platform is designed to help professionals like you connect, collaborate, and grow with confidence.</p>
            <p>Whether you're here to discover high-quality listings, build powerful partnerships, or expand your business reach, you're in the right place.</p>
            <p>Here's how you can get started:</p>
            <ul>
                <li>Complete your profile to showcase your expertise.</li>
                <li>Explore top-tier listings and services.</li>
                <li>Engage with other professionals and businesses.</li>
            </ul>
            <p>If you need support or have any questions, our team is always here to help.</p>
            <p>Welcome aboard — let's redefine what's possible together.</p>
            <p>Best regards,</p>
            <p>The Road Darts Team</p>
            <a href="${process.env.FRONTEND_URL}" class="button">Get Started</a>
            `
    }
    return data
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
        recipient: email,
        html: `
            <h2>New Contact Form Submission</h2>
            <p>You have received a new message from the contact form on Road Dart Stories.</p>
            <hr />
            <p><strong>Full Name:</strong> ${firstname} ${lastname}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-line;">${message}</p>
            <hr />
            <p>Please respond to this inquiry as soon as possible.</p>
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
            <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}" style="display:inline-block;padding:10px 20px;background-color:#007BFF;color:#ffffff;text-decoration:none;border-radius:5px;">Reset Password</a>
            <p>If you didn't request a password reset, please ignore this email or let us know immediately.</p>
            <p>Best regards,</p>
            <p>The Road Dart Stories Team</p>
        `
    };
    return data;
};
