const express = require('express');
const router = express.Router();
const {
    getAnnouncements,
    createAnnouncement,
    deleteAnnouncement,
    updateAnnouncement
} = require('../controllers/announcementController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getAnnouncements);
router.post('/', protect, authorize('admin', 'tpo'), createAnnouncement);
router.delete('/:id', protect, authorize('admin', 'tpo'), deleteAnnouncement);
router.put('/:id', protect, authorize('admin', 'tpo'), updateAnnouncement);

module.exports = router;
