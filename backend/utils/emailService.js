const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
};

// Send verification email
const sendVerificationEmail = async (email, name, verificationToken) => {
    try {
        const transporter = createTransporter();
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

        const mailOptions = {
            from: `"Student Network" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your Email - Student Network',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Arial', sans-serif;
                            line-height: 1.6;
                            color: #333;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 40px auto;
                            background: white;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .content h2 {
                            color: #667eea;
                            margin-top: 0;
                        }
                        .button {
                            display: inline-block;
                            padding: 15px 40px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            font-weight: bold;
                            margin: 20px 0;
                            transition: transform 0.2s;
                        }
                        .button:hover {
                            transform: translateY(-2px);
                        }
                        .footer {
                            background: #f8f9fa;
                            padding: 20px;
                            text-align: center;
                            font-size: 12px;
                            color: #666;
                        }
                        .divider {
                            height: 1px;
                            background: #e0e0e0;
                            margin: 20px 0;
                        }
                        .info-box {
                            background: #f8f9fa;
                            border-left: 4px solid #667eea;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎓 Student Network</h1>
                        </div>
                        <div class="content">
                            <h2>Welcome, ${name}! 👋</h2>
                            <p>Thank you for registering with Student Network. We're excited to have you join our community!</p>
                            
                            <p>To complete your registration and start connecting with students, alumni, and opportunities, please verify your email address by clicking the button below:</p>
                            
                            <div style="text-align: center;">
                                <a href="${verificationUrl}" class="button">Verify Email Address</a>
                            </div>
                            
                            <div class="info-box">
                                <p style="margin: 0;"><strong>⏰ Important:</strong> This verification link will expire in 24 hours.</p>
                            </div>
                            
                            <div class="divider"></div>
                            
                            <p style="font-size: 14px; color: #666;">
                                If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            <p style="font-size: 12px; color: #667eea; word-break: break-all;">
                                ${verificationUrl}
                            </p>
                            
                            <div class="divider"></div>
                            
                            <p style="font-size: 14px; color: #666;">
                                If you didn't create an account with Student Network, please ignore this email.
                            </p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} Student Network. All rights reserved.</p>
                            <p>This is an automated email, please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Verification email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};

// Send password reset email (for future use)
const sendPasswordResetEmail = async (email, name, resetToken) => {
    try {
        const transporter = createTransporter();
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const mailOptions = {
            from: `"Student Network" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request - Student Network',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Arial', sans-serif;
                            line-height: 1.6;
                            color: #333;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 40px auto;
                            background: white;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .button {
                            display: inline-block;
                            padding: 15px 40px;
                            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            font-weight: bold;
                            margin: 20px 0;
                        }
                        .warning-box {
                            background: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Password Reset</h1>
                        </div>
                        <div class="content">
                            <h2>Hello, ${name}</h2>
                            <p>We received a request to reset your password. Click the button below to create a new password:</p>
                            
                            <div style="text-align: center;">
                                <a href="${resetUrl}" class="button">Reset Password</a>
                            </div>
                            
                            <div class="warning-box">
                                <p style="margin: 0;"><strong>⚠️ Security Notice:</strong> This link will expire in 1 hour.</p>
                            </div>
                            
                            <p style="font-size: 14px; color: #666;">
                                If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
};
