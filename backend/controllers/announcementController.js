const Announcement = require('../models/Announcement');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Public
const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 }).populate('postedBy', 'name role');
        res.json(announcements);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (Admin/TPO)
const createAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.create({
            ...req.body,
            postedBy: req.user.id
        });
        res.json(announcement);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin/TPO)
const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).json({ message: 'Not found' });

        if (announcement.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await announcement.deleteOne();
        res.json({ message: 'Removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin/TPO)
const updateAnnouncement = async (req, res) => {
    try {
        let announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).json({ message: 'Not found' });

        if (announcement.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json(announcement);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getAnnouncements,
    createAnnouncement,
    deleteAnnouncement,
    updateAnnouncement
};
