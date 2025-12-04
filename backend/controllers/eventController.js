const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
    try {
        const events = await Event.find().populate('organizer', 'name');
        res.json(events);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @desc    Create event
// @route   POST /api/events
// @access  Private (Admin/Alumni/TPO)
const createEvent = async (req, res) => {
    try {
        const { title, description, date, location, type, bannerImage } = req.body;

        const newEvent = new Event({
            title,
            description,
            date,
            location,
            type,
            bannerImage,
            organizer: req.user.id
        });

        const event = await newEvent.save();
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin/Owner)
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Check user (Admin or TPO or Organizer)
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'tpo') {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await event.deleteOne();
        res.json({ message: 'Event removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Register for event
// @route   PUT /api/events/:id/register
// @access  Private
const registerForEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Check if already registered
        const isRegistered = event.registrations.some(
            reg => reg.user.toString() === req.user.id
        );

        if (isRegistered) {
            return res.status(400).json({ message: 'Already registered' });
        }

        event.registrations.push({ user: req.user.id });
        // Also add to attendees for backward compatibility if needed
        if (!event.attendees.includes(req.user.id)) {
            event.attendees.push(req.user.id);
        }

        await event.save();
        res.json(event.registrations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get event registrations
// @route   GET /api/events/:id/registrations
// @access  Private (Admin/TPO/Organizer)
const getEventRegistrations = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('registrations.user', 'name email role');
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Check authorization
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'tpo') {
            return res.status(401).json({ message: 'Not authorized to view registrations' });
        }

        res.json(event.registrations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getEvents,
    createEvent,
    deleteEvent,
    registerForEvent,
    getEventRegistrations
};
