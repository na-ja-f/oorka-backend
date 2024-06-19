const asyncHandler = require('express-async-handler')
const Conversation = require('../models/conversationModel')
const Message = require('../models/messagesModel')
const Connections = require('../models/connectionModel')
const User = require('../models/userModel')

// ! add conversation
// ? POST /chat/add-conversation
const addConversation = asyncHandler(async (req, res) => {
    const { senderId, receiverId } = req.body
    const existConversation = await Conversation.findOne({
        members: { $all: [senderId, receiverId] },
    }).populate({
        path: "members",
        select: "name profileImg isVerified",
    });

    if (existConversation) {
        res.status(200).json(existConversation);
        return;
    }

    const newConversation = new Conversation({
        members: [senderId, receiverId],
    });

    try {
        const savedConversation = await newConversation.save();
        const conversation = await Conversation.findById(
            savedConversation._id
        ).populate({
            path: "members",
            select: "name profileImg isVerified",
        });
        res.status(200).json(conversation);
    } catch (err) {
        res.status(500).json(err);
    }

})

// ! get user conversations
// ? GET /chat/get-conversations
const getUserConversation = asyncHandler(async (req, res) => {
    try {
        const conversations = await Conversation.find({
            members: { $in: [req.params.userId] },
        })
            .populate({
                path: "members",
                select: "name profileImg isVerified lastSeen",
            })
            .sort({ updatedAt: -1 });

        const conversationsWithMessages = await Promise.all(
            conversations.map(async (conversation) => {
                const messagesCount = await Message.countDocuments({
                    conversationId: conversation._id,
                });
                return messagesCount > 0 ? conversation : null;
            })
        );

        const filteredConversations = conversationsWithMessages.filter(
            (conversation) => conversation !== null
        );

        res.status(200).json(filteredConversations);
    } catch (err) {
        res.status(500).json(err);
    }
})

// ! add new message
// ? POST /chat/add-message
const addMessage = asyncHandler(async (req, res) => {
    const { conversationId, sender, text } = req.body;
    console.log('message',conversationId, sender, text);
    let content = text;
    let attachment = null;

    console.log('filename',req.file);
    if (req.file) {
        let type;
        if (req.file.mimetype.startsWith("image/")) {
            type = "image";
        } else if (req.file.mimetype.startsWith("video/")) {
            type = "video";
        } else if (req.file.mimetype.startsWith("audio/")) {
            type = "audio";
        } else {
            type = "file";
        }
        attachment = {
            type: type,
            url: req.file.path,
            filename: req.file.filename,
            size: req.file.size,
        };
        content = req.body.messageType;
    }

    const newMessage = new Message({
        conversationId ,
        sender,
        text: content,
        attachment,
    });
    console.log('message', newMessage);
    await Conversation.findByIdAndUpdate(
        conversationId,
        { updatedAt: Date.now() },
        { new: true }
    );
    try {
        const savedMessage = await newMessage.save();
        res.status(200).json(savedMessage);
    } catch (err) {
        res.status(500).json(err);
    }
})

// ! get user  message
// ? GET /chat/get-message
const getMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({
            conversationId: req.params.conversationId,
        }).populate({
            path: "sender",
            select: "name profileImg isVerified",
        });

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json(err);
    }
})

// ! get last messages
// ? POST /chat/get-conversations
const getLastMessages = asyncHandler(async (req, res) => {
    try {
        const pipeline = [
            {
                $sort: { createdAt: -1 },
            },
            {
                $group: {
                    _id: "$conversationId",
                    lastMessage: { $first: "$$ROOT" },
                },
            },
            {
                $replaceRoot: { newRoot: "$lastMessage" },
            },
        ];

        const lastMessages = await Message.aggregate(pipeline);
        res.status(200).json(lastMessages);
    } catch (err) {
        res.status(500).json(err);
    }
})

// ! get eligible users
// ? POST /chat/get-eligible-users
const getEligibleUsers = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.body;
        const connections = await Connections.findOne(
            { userId },
            { following: 1 }
        );
        const followingUsers = connections?.following;
        const users = await User.find({
            $or: [{ isPrivate: false }, { _id: { $in: followingUsers } }],
        });
        res.status(200).json({ users });
    } catch (err) {
        res.status(500).json(err);
    }
})

// ! set  message read
// ? PATCH /chat/set-message-read
const setMessageRead = asyncHandler(async (req, res) => {
    try {
        const { conversationId, userId } = req.body;
        console.log(conversationId, userId + "Reading Messages");
        const messages = await Message.updateMany(
            { conversationId: conversationId, sender: { $ne: userId } },
            { $set: { isRead: true } }
        );
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json(err);
    }
})

// ! get unread messages
// ? POST /chat/get-unread-messages
const getUnreadMessages = asyncHandler(async (req, res) => {
    try {
        const { conversationId, userId } = req.body;
        console.log(conversationId, userId + "unreadMessages getting....");
        const messages = await Message.find({
            conversationId: conversationId,
            sender: { $ne: userId },
            isRead: false,
        });
        console.log(messages);
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json(err);
    }
})



module.exports = {
    addConversation,
    getUserConversation,
    getLastMessages,
    getEligibleUsers,
    getUnreadMessages,
    addMessage,
    getMessages,
    setMessageRead
}