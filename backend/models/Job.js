const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a job title'],
    },
    company: {
        type: String,
        required: [true, 'Please add a company name'],
    },
    location: {
        type: String,
        required: [true, 'Please add a location'],
    },
    type: {
        type: String,
        enum: ['full-time', 'part-time', 'internship', 'contract'],
        default: 'full-time',
    },
    description: {
        type: String,
        required: [true, 'Please add a job description'],
    },
    requirements: {
        type: [String],
        default: [],
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    applicationLink: {
        type: String,
    },
    deadline: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    applications: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        resumeLink: {
            type: String
        },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'accepted', 'rejected'],
            default: 'pending'
        },
        appliedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
