import express from 'express';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/messages/conversations — list all conversations
router.get('/conversations', protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
      deletedBy: { $ne: req.user._id }
    })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .populate('auction', 'title images')
      .sort({ createdAt: -1 });

    // Group by conversationId
    const conversations = {};
    messages.forEach((msg) => {
      if (!conversations[msg.conversationId]) {
        const other = msg.sender._id.toString() === userId ? msg.receiver : msg.sender;
        conversations[msg.conversationId] = {
          conversationId: msg.conversationId,
          otherUser: other,
          lastMessage: msg,
          unreadCount: 0,
          auction: msg.auction,
        };
      }
      if (!msg.read && msg.receiver._id.toString() === userId)
        conversations[msg.conversationId].unreadCount++;
    });

    res.json(Object.values(conversations));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/messages/:conversationId — messages in a conversation
router.get('/:conversationId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ 
      conversationId: req.params.conversationId,
      deletedBy: { $ne: req.user._id }
    })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany(
      { conversationId: req.params.conversationId, receiver: req.user._id, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/messages — send message
router.post('/', protect, async (req, res) => {
  try {
    const { receiverId, content, auctionId } = req.body;
    const ids = [req.user._id.toString(), receiverId].sort();
    const conversationId = `${ids[0]}_${ids[1]}${auctionId ? `_${auctionId}` : ''}`;

    const message = await Message.create({
      conversationId, sender: req.user._id, receiver: receiverId, content,
      auction: auctionId || null,
    });

    await message.populate('sender', 'name avatar');

    // Emit socket event
    if (req.io) {
      req.io.to(`user_${receiverId}`).emit('new_message', message);
    }

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/messages/:conversationId — soft bulk delete
router.delete('/:conversationId', protect, async (req, res) => {
  try {
    await Message.updateMany(
      { conversationId: req.params.conversationId },
      { $addToSet: { deletedBy: req.user._id } }
    );
    res.json({ message: 'Conversation softly deleted from user side' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
