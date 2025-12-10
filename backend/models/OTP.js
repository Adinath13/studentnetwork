const mongoose = require('mongoose');
const crypto = require('crypto');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    otpHash: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        index: { expires: 0 }, // TTL index - automatically delete expired documents
    },
    attempts: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Hash OTP before saving
otpSchema.methods.hashOTP = function (otp) {
    this.otpHash = crypto
        .createHash('sha256')
        .update(otp.toString())
        .digest('hex');
};

// Verify OTP
otpSchema.methods.verifyOTP = function (otp) {
    const hashedOTP = crypto
        .createHash('sha256')
        .update(otp.toString())
        .digest('hex');

    return this.otpHash === hashedOTP;
};

// Check if OTP is expired
otpSchema.methods.isExpired = function () {
    return Date.now() > this.expiresAt;
};

// Increment attempt counter
otpSchema.methods.incrementAttempts = async function () {
    this.attempts += 1;
    await this.save();
};

// Static method to generate 6-digit OTP
otpSchema.statics.generateOTP = function () {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Static method to create OTP for email
otpSchema.statics.createOTP = async function (email) {
    // Delete any existing OTPs for this email
    await this.deleteMany({ email });

    // Generate new OTP
    const otpCode = this.generateOTP();

    // Create new OTP document
    const otp = new this({ email });
    otp.hashOTP(otpCode);
    await otp.save();

    return otpCode;
};

module.exports = mongoose.model('OTP', otpSchema);
