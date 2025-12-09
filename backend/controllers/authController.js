const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/emailService');

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

            // Send verification email
            try {
                await sendVerificationEmail(user.email, user.name, verificationToken);
                console.log('✅ User registered successfully:', { id: user._id, email: user.email, role: user.role });

                res.status(201).json({
                    success: true,
                    message: 'Registration successful! Please check your email to verify your account.',
                    email: user.email,
                });
            } catch (emailError) {
                // If email fails, delete the user and return error
                await User.findByIdAndDelete(user._id);
                console.error('❌ Failed to send verification email:', emailError);
                return res.status(500).json({
                    message: 'Registration failed. Could not send verification email. Please try again.',
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
            // Check if email is verified
            if (!user.isEmailVerified) {
                console.log('❌ Login failed: Email not verified');
                return res.status(401).json({
                    message: 'Please verify your email before logging in',
                    emailNotVerified: true,
                    email: user.email,
                });
            }

            console.log('✅ Login successful:', { id: user._id, email: user.email, role: user.role });
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
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

module.exports = {
    registerUser,
    loginUser,
    getMe,
    verifyEmail,
    resendVerificationEmail,
};
