const nodemailer = require('nodemailer');

// Check if email service is configured
const isEmailConfigured = () => {
    const hasEmailUser = process.env.EMAIL_USER && process.env.EMAIL_USER.trim() !== '';
    const hasEmailPassword = process.env.EMAIL_PASSWORD && process.env.EMAIL_PASSWORD.trim() !== '';
    return hasEmailUser && hasEmailPassword;
};

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
    if (!isEmailConfigured()) {
        throw new Error('Email service is not configured. Please set EMAIL_USER and EMAIL_PASSWORD environment variables.');
    }

    const emailService = process.env.EMAIL_SERVICE || 'gmail';

    // Gmail - use port 465 (SSL) for better compatibility
    if (emailService.toLowerCase() === 'gmail') {
        return nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    // Mailgun uses SMTP
    if (emailService.toLowerCase() === 'mailgun') {
        return nodemailer.createTransport({
            host: process.env.MAILGUN_SMTP_HOST || 'smtp.mailgun.org',
            port: parseInt(process.env.MAILGUN_SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    // Other services
    return nodemailer.createTransport({
        service: emailService,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
};

// Email template styles
const getEmailStyles = () => `
    body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background-color: #f4f4f4;
    }
    .email-container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
    }
    .email-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 40px 30px;
        text-align: center;
    }
    .email-header h1 {
        margin: 0;
        color: #ffffff;
        font-size: 28px;
        font-weight: 600;
    }
    .email-body {
        padding: 40px 30px;
        color: #333333;
        line-height: 1.6;
    }
    .email-body p {
        margin: 0 0 16px 0;
        font-size: 16px;
    }
    .greeting {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 20px;
    }
    .button-container {
        text-align: center;
        margin: 30px 0;
    }
    .email-button {
        display: inline-block;
        padding: 14px 40px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        transition: transform 0.2s;
    }
    .email-button:hover {
        transform: translateY(-2px);
    }
    .otp-code {
        background: #f8f9fa;
        border: 2px dashed #667eea;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        margin: 25px 0;
    }
    .otp-digits {
        font-size: 36px;
        font-weight: 700;
        color: #667eea;
        letter-spacing: 8px;
        font-family: 'Courier New', monospace;
    }
    .link-text {
        word-break: break-all;
        color: #667eea;
        font-size: 14px;
        background: #f8f9fa;
        padding: 12px;
        border-radius: 6px;
        margin: 15px 0;
    }
    .info-box {
        background: #fff3cd;
        border-left: 4px solid #ffc107;
        padding: 15px;
        margin: 20px 0;
        border-radius: 4px;
    }
    .info-box p {
        margin: 0;
        color: #856404;
        font-size: 14px;
    }
    .email-footer {
        background: #f8f9fa;
        padding: 30px;
        text-align: center;
        border-top: 1px solid #e9ecef;
    }
    .email-footer p {
        margin: 5px 0;
        color: #6c757d;
        font-size: 14px;
    }
    .divider {
        height: 1px;
        background: #e9ecef;
        margin: 25px 0;
    }
`;

// Email verification template
const getVerificationEmailTemplate = (name, verificationUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Student Network</title>
    <style>${getEmailStyles()}</style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>🎓 Welcome to Student Network!</h1>
        </div>
        
        <div class="email-body">
            <p class="greeting">Hello ${name},</p>
            
            <p>Thank you for registering with Student Network! We're excited to have you join our community of students, teachers, and mentors.</p>
            
            <p>To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
            
            <div class="button-container">
                <a href="${verificationUrl}" class="email-button">Verify Email Address</a>
            </div>
            
            <p style="font-size: 14px; color: #6c757d;">If the button doesn't work, copy and paste this link into your browser:</p>
            <div class="link-text">${verificationUrl}</div>
            
            <div class="divider"></div>
            
            <div class="info-box">
                <p><strong>⏱️ This verification link will expire in 24 hours.</strong></p>
            </div>
            
            <p style="font-size: 14px; color: #6c757d; margin-top: 25px;">If you didn't create an account with Student Network, you can safely ignore this email.</p>
        </div>
        
        <div class="email-footer">
            <p><strong>Student Network</strong></p>
            <p>Connecting students, teachers, and mentors</p>
            <p style="margin-top: 15px;">&copy; ${new Date().getFullYear()} Student Network. All rights reserved.</p>
            <p style="font-size: 12px; color: #adb5bd;">Designed & Developed by ADINATH GORE</p>
        </div>
    </div>
</body>
</html>
`;

// OTP email template
const getOTPEmailTemplate = (name, otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP - Student Network</title>
    <style>${getEmailStyles()}</style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>🔐 Password Reset Request</h1>
        </div>
        
        <div class="email-body">
            <p class="greeting">Hello ${name},</p>
            
            <p>We received a request to reset your password for your Student Network account. Use the OTP code below to proceed with resetting your password:</p>
            
            <div class="otp-code">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #6c757d; font-weight: 600;">YOUR OTP CODE</p>
                <div class="otp-digits">${otp}</div>
            </div>
            
            <div class="info-box">
                <p><strong>⏱️ This OTP will expire in 10 minutes.</strong></p>
            </div>
            
            <div class="divider"></div>
            
            <p style="font-size: 14px;"><strong>Security Tips:</strong></p>
            <ul style="font-size: 14px; color: #6c757d; line-height: 1.8;">
                <li>Never share this OTP with anyone</li>
                <li>Student Network staff will never ask for your OTP</li>
                <li>If you didn't request this, please ignore this email</li>
            </ul>
            
            <p style="font-size: 14px; color: #6c757d; margin-top: 25px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
        
        <div class="email-footer">
            <p><strong>Student Network</strong></p>
            <p>Connecting students, teachers, and mentors</p>
            <p style="margin-top: 15px;">&copy; ${new Date().getFullYear()} Student Network. All rights reserved.</p>
            <p style="font-size: 12px; color: #adb5bd;">Designed & Developed by ADINATH GORE</p>
        </div>
    </div>
</body>
</html>
`;

// Send verification email
const sendVerificationEmail = async (email, name, verificationToken) => {
    try {
        // Check if email service is configured
        if (!isEmailConfigured()) {
            console.warn('⚠️ Email service not configured. Skipping verification email.');
            return {
                success: false,
                error: 'EMAIL_NOT_CONFIGURED',
                message: 'Email service is not configured'
            };
        }

        const transporter = createTransporter();
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

        const mailOptions = {
            from: `"Student Network" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '✉️ Verify Your Email - Student Network',
            html: getVerificationEmailTemplate(name, verificationUrl),
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Verification email sent successfully to:', email);

        return {
            success: true,
            message: 'Verification email sent successfully'
        };
    } catch (error) {
        console.error('❌ Error sending verification email:', error);
        return {
            success: false,
            error: 'EMAIL_SEND_FAILED',
            message: error.message
        };
    }
};

// Send OTP email for password reset
const sendOTPEmail = async (email, name, otp) => {
    try {
        if (!isEmailConfigured()) {
            console.warn('⚠️ Email service not configured. Skipping OTP email.');
            return {
                success: false,
                error: 'EMAIL_NOT_CONFIGURED',
                message: 'Email service is not configured'
            };
        }

        const transporter = createTransporter();

        const mailOptions = {
            from: `"Student Network" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🔐 Password Reset OTP - Student Network',
            html: getOTPEmailTemplate(name, otp),
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ OTP email sent successfully to:', email);

        return {
            success: true,
            message: 'OTP email sent successfully'
        };
    } catch (error) {
        console.error('❌ Error sending OTP email:', error);
        return {
            success: false,
            error: 'EMAIL_SEND_FAILED',
            message: error.message
        };
    }
};

module.exports = {
    sendVerificationEmail,
    sendOTPEmail,
    isEmailConfigured,
};
