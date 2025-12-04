const express = require('express');
const router = express.Router();
const {
    getEvents,
    createEvent,
    deleteEvent,
    registerForEvent,
    getEventRegistrations
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getEvents);
router.post('/', protect, authorize('admin', 'alumni', 'tpo'), createEvent);
router.delete('/:id', protect, authorize('admin', 'alumni', 'tpo'), deleteEvent);
router.put('/:id/register', protect, registerForEvent);
router.get('/:id/registrations', protect, authorize('admin', 'tpo', 'alumni'), getEventRegistrations);

module.exports = router;
