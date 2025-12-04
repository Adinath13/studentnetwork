const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Mentorship = require('../models/Mentorship');

// @desc    Get all conversations for current user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
    // Block admin from accessing chat
    if (req.user.role === 'admin') {
        return res.status(403).json({ message: 'Admins are not allowed to use the messaging system' });
    }

    try {
        const conversations = await Conversation.find({
            participants: { $in: [req.user._id] }
        })
            .populate('participants', 'name email role')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create or get existing conversation
// @route   POST /api/chat/conversation
// @access  Private
const createOrGetConversation = async (req, res) => {
    // Block admin from accessing chat
    if (req.user.role === 'admin') {
        return res.status(403).json({ message: 'Admins are not allowed to use the messaging system' });
    }

    const { receiverId } = req.body;

    if (!receiverId) {
        return res.status(400).json({ message: 'Receiver ID is required' });
    }

    try {
        // Check if receiver is admin
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (receiver.role === 'admin') {
            return res.status(403).json({ message: 'Cannot create conversation with admin users' });
        }

        // Check for active mentorship connection if not TPO (TPO might need to chat with everyone, but user said mentor-student communication. Let's restrict for now unless role is TPO)
        // Actually, user said "Messaging support for mentor–student communication".
        // Let's enforce connection for Student <-> Alumni
        if (
            (req.user.role === 'student' && receiver.role === 'alumni') ||
            (req.user.role === 'alumni' && receiver.role === 'student')
        ) {
            const mentorship = await Mentorship.findOne({
                $or: [
                    { student: req.user._id, mentor: receiverId },
                    { student: receiverId, mentor: req.user._id }
                ],
                status: 'active'
            });

            if (!mentorship) {
                return res.status(403).json({ message: 'You can only message users you have an active mentorship with.' });
            }
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [req.user._id, receiverId] }
        })
            .populate('participants', 'name email role')
            .populate('lastMessage');

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [req.user._id, receiverId]
            });
            conversation = await conversation.populate('participants', 'name email role');
        }

        res.status(200).json(conversation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send a message
// @route   POST /api/chat/message
// @access  Private
const sendMessage = async (req, res) => {
    // Block admin from accessing chat
    if (req.user.role === 'admin') {
        return res.status(403).json({ message: 'Admins are not allowed to use the messaging system' });
    }

    const { conversationId, text } = req.body;

    if (!conversationId || !text) {
        return res.status(400).json({ message: 'Conversation ID and text are required' });
    }

    try {
        const newMessage = await Message.create({
            conversationId,
            sender: req.user._id,
            text
        });

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: newMessage._id,
            updatedAt: Date.now()
        });

        // Populate sender details for real-time updates if needed
        const populatedMessage = await newMessage.populate('sender', 'name email');

        res.status(201).json(populatedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get messages for a conversation
// @route   GET /api/chat/messages/:conversationId
// @access  Private
const getMessages = async (req, res) => {
    // Block admin from accessing chat
    if (req.user.role === 'admin') {
        return res.status(403).json({ message: 'Admins are not allowed to use the messaging system' });
    }

    const { conversationId } = req.params;

    try {
        const messages = await Message.find({ conversationId })
            .populate('sender', 'name email')
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark message as seen
// @route   PUT /api/chat/message/:messageId/seen
// @access  Private
const markMessageAsSeen = async (req, res) => {
    const { messageId } = req.params;

    try {
        const message = await Message.findByIdAndUpdate(
            messageId,
            { seen: true },
            { new: true }
        );

        res.status(200).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users for messaging (connected mentors/mentees only)
// @route   GET /api/chat/users
// @access  Private
const getUsersForMessaging = async (req, res) => {
    // Block admin from accessing chat
    if (req.user.role === 'admin') {
        return res.status(403).json({ message: 'Admins are not allowed to use the messaging system' });
    }

    try {
        console.log(`💬 Fetching chat users for: ${req.user.name} (${req.user.role})`);
        let relatedUserIds = [];

        if (req.user.role === 'student') {
            // Students can only chat with their active mentors
            const mentorships = await Mentorship.find({
                student: req.user._id,
                status: 'active'
            });
            console.log(`   Found ${mentorships.length} active mentorships as student`);
            relatedUserIds = mentorships.map(m => m.mentor);
        } else if (req.user.role === 'alumni') {
            // Mentors can only chat with their active mentees
            const mentorships = await Mentorship.find({
                mentor: req.user._id,
                status: 'active'
            });
            console.log(`   Found ${mentorships.length} active mentorships as mentor`);
            relatedUserIds = mentorships.map(m => m.student);
        } else if (req.user.role === 'tpo') {
            relatedUserIds = [];
        }

        const users = await User.find({
            _id: { $in: relatedUserIds }
        }).select('name email role profilePicture'); // Added profilePicture

        console.log(`   Returning ${users.length} users for messaging`);
        res.status(200).json(users);
    } catch (error) {
        console.error('❌ Error fetching chat users:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all conversations for admin/TPO (for moderation)
// @route   GET /api/messages/admin/all-conversations
// @access  Private (Admin/TPO only)
const getAllConversationsForAdmin = async (req, res) => {
    try {
        // Only allow admin and tpo
        if (req.user.role !== 'admin' && req.user.role !== 'tpo') {
            return res.status(403).json({ message: 'Access denied. Admin or TPO role required.' });
        }

        const conversations = await Conversation.find({})
            .populate('participants', 'name email role')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get specific conversation details for admin/TPO
// @route   GET /api/messages/admin/conversation/:conversationId
// @access  Private (Admin/TPO only)
const getConversationDetailsForAdmin = async (req, res) => {
    try {
        // Only allow admin and tpo
        if (req.user.role !== 'admin' && req.user.role !== 'tpo') {
            return res.status(403).json({ message: 'Access denied. Admin or TPO role required.' });
        }

        const { conversationId } = req.params;

        const conversation = await Conversation.findById(conversationId)
            .populate('participants', 'name email role')
            .populate('lastMessage');

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        const messages = await Message.find({ conversationId })
            .populate('sender', 'name email role')
            .sort({ createdAt: 1 });

        res.status(200).json({
            conversation,
            messages
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getConversations,
    createOrGetConversation,
    sendMessage,
    getMessages,
    markMessageAsSeen,
    getUsersForMessaging,
    getAllConversationsForAdmin,
    getConversationDetailsForAdmin
};
