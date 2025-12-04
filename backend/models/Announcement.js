const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
    },
    content: {
        type: String,
        required: [true, 'Please add content'],
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    targetAudience: {
        type: String,
        enum: ['all', 'alumni', 'student', 'tpo'],
        default: 'all',
    },
    type: {
        type: String,
        enum: ['announcement', 'news'],
        default: 'announcement'
    },
    isImportant: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
