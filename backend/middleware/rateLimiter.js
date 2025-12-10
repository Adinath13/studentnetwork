const rateLimit = new Map();

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
    maxRequests: 3, // Maximum requests per time window
    timeWindow: 60 * 60 * 1000, // 1 hour in milliseconds
    cooldown: 15 * 60 * 1000, // 15 minutes cooldown between requests
};

// Clean up expired rate limit entries
const cleanupExpiredEntries = () => {
    const now = Date.now();
    for (const [key, data] of rateLimit.entries()) {
        if (now - data.firstRequest > RATE_LIMIT_CONFIG.timeWindow) {
            rateLimit.delete(key);
        }
    }
};

// Rate limiter middleware for OTP requests
const otpRateLimiter = (req, res, next) => {
    const email = req.body.email?.toLowerCase().trim();

    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email is required',
        });
    }

    // Clean up old entries periodically
    cleanupExpiredEntries();

    const now = Date.now();
    const userRateData = rateLimit.get(email);

    // First request from this email
    if (!userRateData) {
        rateLimit.set(email, {
            count: 1,
            firstRequest: now,
            lastRequest: now,
        });
        return next();
    }

    // Check if time window has passed
    if (now - userRateData.firstRequest > RATE_LIMIT_CONFIG.timeWindow) {
        // Reset the rate limit
        rateLimit.set(email, {
            count: 1,
            firstRequest: now,
            lastRequest: now,
        });
        return next();
    }

    // Check cooldown period
    const timeSinceLastRequest = now - userRateData.lastRequest;
    if (timeSinceLastRequest < RATE_LIMIT_CONFIG.cooldown) {
        const remainingCooldown = Math.ceil((RATE_LIMIT_CONFIG.cooldown - timeSinceLastRequest) / 60000);
        return res.status(429).json({
            success: false,
            message: `Please wait ${remainingCooldown} minute(s) before requesting another OTP`,
            retryAfter: remainingCooldown,
        });
    }

    // Check if max requests exceeded
    if (userRateData.count >= RATE_LIMIT_CONFIG.maxRequests) {
        const timeUntilReset = Math.ceil((RATE_LIMIT_CONFIG.timeWindow - (now - userRateData.firstRequest)) / 60000);
        return res.status(429).json({
            success: false,
            message: `Too many OTP requests. Please try again in ${timeUntilReset} minute(s)`,
            retryAfter: timeUntilReset,
        });
    }

    // Update rate limit data
    userRateData.count += 1;
    userRateData.lastRequest = now;
    rateLimit.set(email, userRateData);

    next();
};

// Get rate limit info for an email (useful for debugging)
const getRateLimitInfo = (email) => {
    const data = rateLimit.get(email?.toLowerCase().trim());
    if (!data) return null;

    const now = Date.now();
    return {
        requestCount: data.count,
        remainingRequests: Math.max(0, RATE_LIMIT_CONFIG.maxRequests - data.count),
        timeWindowRemaining: Math.ceil((RATE_LIMIT_CONFIG.timeWindow - (now - data.firstRequest)) / 60000),
        cooldownRemaining: Math.ceil(Math.max(0, RATE_LIMIT_CONFIG.cooldown - (now - data.lastRequest)) / 60000),
    };
};

module.exports = {
    otpRateLimiter,
    getRateLimitInfo,
};
