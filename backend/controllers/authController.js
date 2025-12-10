const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendVerificationEmail, sendOTPEmail } = require('../utils/emailService');


// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        console.log('📝 Registration attempt:', { email: req.body.email, role: req.body.role });

        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            console.log('❌ Registration failed: Missing fields');
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log('❌ Registration failed: User already exists');
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'student',
        });

        if (user) {
            // Generate email verification token
            const verificationToken = user.generateEmailVerificationToken();
            await user.save();

            // Try to send verification email
            try {
                const emailResult = await sendVerificationEmail(user.email, user.name, verificationToken);

                if (emailResult.success) {
                    // Email sent successfully
                    console.log('✅ Verification email sent successfully');
                    res.status(201).json({
                        success: true,
                        message: 'Registration successful! Please check your email to verify your account.',
                        email: user.email,
                        requiresVerification: true,
                    });
                } else if (emailResult.error === 'EMAIL_NOT_CONFIGURED') {
                    // Email service not configured - user stays unverified but can login
                    console.warn('⚠️ Email service not configured. User registered but unverified.');
                    res.status(201).json({
                        success: true,
                        message: 'Registration successful! Email verification is currently unavailable. You can login and verify later.',
                        email: user.email,
                        requiresVerification: false,
                        token: generateToken(user._id),
                        user: {
                            _id: user._id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            isEmailVerified: false,
                        }
                    });
                } else {
                    // Email sending failed - user stays unverified but can login
                    console.error('❌ Failed to send verification email:', emailResult);
                    res.status(201).json({
                        success: true,
                        message: 'Registration successful! Email verification is currently unavailable. You can login and verify later.',
                        email: user.email,
                        requiresVerification: false,
                        token: generateToken(user._id),
                        user: {
                            _id: user._id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            isEmailVerified: false,
                        }
                    });
                }
            } catch (emailError) {
                // Unexpected error - user stays unverified but can login
                console.error('❌ Unexpected error during email verification:', emailError);
                res.status(201).json({
                    success: true,
                    message: 'Registration successful! Email verification is currently unavailable. You can login and verify later.',
                    email: user.email,
                    requiresVerification: false,
                    token: generateToken(user._id),
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        isEmailVerified: false,
                    }
                });
            }
        } else {
            console.log('❌ Registration failed: Invalid user data');
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('❌ Registration error:');
        console.error('   Message:', error.message);
        console.error('   Stack:', error.stack);
        res.status(500).json({
            message: 'Server error during registration',
            error: error.message
        });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        console.log('🔐 Login attempt:', { email: req.body.email });

        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log('❌ Login failed: User not found');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordMatch = await user.matchPassword(password);

        if (user && isPasswordMatch) {
            // Email verification is now optional - users can verify from their profile
            console.log('✅ Login successful:', { id: user._id, email: user.email, role: user.role, emailVerified: user.isEmailVerified });
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                token: generateToken(user._id),
            });
        } else {
            console.log('❌ Login failed: Invalid password');
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('❌ Login error:');
        console.error('   Message:', error.message);
        console.error('   Stack:', error.stack);
        res.status(500).json({
            message: 'Server error during login',
            error: error.message
        });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    const user = await User.findById(req.user.id);
    res.status(200).json(user);
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        // Hash the token to compare with database
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with matching token and not expired
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() },
        }).select('+emailVerificationToken +emailVerificationExpires');

        if (!user) {
            console.log('❌ Email verification failed: Invalid or expired token');
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification link',
            });
        }

        // Update user
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        console.log('✅ Email verified successfully:', { email: user.email });

        res.status(200).json({
            success: true,
            message: 'Email verified successfully! You can now log in.',
        });
    } catch (error) {
        console.error('❌ Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during email verification',
            error: error.message,
        });
    }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Please provide an email address' });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal if user exists or not for security
            return res.status(200).json({
                success: true,
                message: 'If an account exists with this email, a verification email has been sent.',
            });
        }

        // Check if already verified
        if (user.isEmailVerified) {
            return res.status(400).json({
                message: 'Email is already verified. Please log in.',
            });
        }

        // Generate new verification token
        const verificationToken = user.generateEmailVerificationToken();
        await user.save();

        // Send verification email
        await sendVerificationEmail(user.email, user.name, verificationToken);

        console.log('✅ Verification email resent:', { email: user.email });

        res.status(200).json({
            success: true,
            message: 'Verification email sent! Please check your inbox.',
        });
    } catch (error) {
        console.error('❌ Resend verification error:', error);
        res.status(500).json({
            message: 'Failed to resend verification email',
            error: error.message,
        });
    }
};

// @desc    Request password reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address',
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        // Don't reveal if user exists or not for security
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If an account exists with this email, an OTP has been sent.',
            });
        }

        // Generate OTP
        const otpCode = await OTP.createOTP(user.email);

        // Send OTP email
        const emailResult = await sendOTPEmail(user.email, user.name, otpCode);

        if (!emailResult.success) {
            console.error('❌ Failed to send OTP email:', emailResult);
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP email. Please try again later.',
            });
        }

        console.log('✅ Password reset OTP sent:', { email: user.email });

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email. Please check your inbox.',
        });
    } catch (error) {
        console.error('❌ Request password reset error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process password reset request',
            error: error.message,
        });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and OTP',
            });
        }

        // Find OTP record
        const otpRecord = await OTP.findOne({
            email: email.toLowerCase().trim(),
        }).sort({ createdAt: -1 }); // Get the most recent OTP

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP',
            });
        }

        // Check if expired
        if (otpRecord.isExpired()) {
            await otpRecord.deleteOne();
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.',
            });
        }

        // Check attempts (max 5 attempts)
        if (otpRecord.attempts >= 5) {
            await otpRecord.deleteOne();
            return res.status(400).json({
                success: false,
                message: 'Too many failed attempts. Please request a new OTP.',
            });
        }

        // Verify OTP
        if (!otpRecord.verifyOTP(otp)) {
            await otpRecord.incrementAttempts();
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP. Please try again.',
                attemptsRemaining: 5 - otpRecord.attempts - 1,
            });
        }

        console.log('✅ OTP verified successfully:', { email });

        // Generate a temporary token for password reset
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Store reset token in user document
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save();

        // Delete OTP record
        await otpRecord.deleteOne();

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            resetToken, // Send unhashed token to client
        });
    } catch (error) {
        console.error('❌ Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP',
            error: error.message,
        });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide reset token and new password',
            });
        }

        // Validate password strength
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long',
            });
        }

        // Hash the token
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Find user with valid reset token
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        }).select('+passwordResetToken +passwordResetExpires');

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token',
            });
        }

        // Update password
        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        console.log('✅ Password reset successfully:', { email: user.email });

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now login with your new password.',
        });
    } catch (error) {
        console.error('❌ Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password',
            error: error.message,
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    verifyEmail,
    resendVerificationEmail,
    requestPasswordReset,
    verifyOTP,
    resetPassword,
};
