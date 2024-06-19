const asyncHandler = require('express-async-handler')
const Conversation = require('../models/conversationModel')
const Message = require('../models/messagesModel')
const Connections = require('../models/connectionModel')
const User = require('../models/userModel')
const GroupChat = require('../models/groupChatModel')
const GroupMessages = require('../models/groupMessagesModel')

// ! get all groups
// ? GET /chat/get-groups
const addGroup = asyncHandler(async (req, res) => {
    const { name, image, users, description, admins } = req.body;
    const usersArray = users.map((user) => user.value);

    const newConversation = new GroupChat({
        name,
        members: [...usersArray],
        description,
        admins,
        profile: image,
    });
    try {
        const savedGroupchat = await newConversation.save();
        const groups = await GroupChat.find({
            _id: savedGroupchat._id,
        }).populate({
            path: "members",
            select: "name profileImg isVerified",
        });
        res.status(200).json(groups);
    } catch (err) {
        res.status(500).json(err);
    }
})

// ! get all groups
// ? GET /chat/get-groups
const getGroups = asyncHandler(async (req, res) => {
    try {
        console.log(req.params.userId + "groups");
        const groups = await GroupChat.find({
            $or: [
                { members: { $in: [req.params.userId] } },
                { admins: { $in: [req.params.userId] } },
            ],
        }).populate({
            path: "members",
            select: "name profileImg isVerified",
        }).sort({ updated_at: -1 });
        res.status(200).json(groups);
    } catch (err) {
        res.status(500).json(err);
    }
})

// ! add new message
// ? POST /chat/add-group-message
const addGroupMessage = asyncHandler(async (req, res) => {
    const { groupId, sender, text } = req.body;
    let content = text;
    let attachment = null;

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
    const newMessage = new GroupMessages({
        groupId,
        sender,
        text: content,
        attachment,
    });
    await GroupChat.findByIdAndUpdate(
        groupId,
        { updated_at: Date.now() },
        { new: true }
    );
    try {
        const savedMessage = await newMessage.save();
        res.status(200).json(savedMessage);
    } catch (err) {
        res.status(500).json(err);
    }
})

// ! get  group messages
// ? GET /chat/last-group-messages
const getGroupMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await GroupMessages.find({
            groupId: req.params.groupId,
        }).populate({
            path: "sender",
            select: "name profileImg isVerified",
        });

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json(err);
    }
})

// ! get  group messages
// ? GET /chat/last-group-messages
const getGroupMembers = asyncHandler(async (req, res) => {
    try {
        const groupMembers = await GroupChat.find({
            _id: req.params.groupId,
        }).populate({
            path: "members",
            select: "name profileImg isVerified",
        });
        console.log(groupMembers);
        res.status(200).json(groupMembers);
    } catch (err) {
        res.status(500).json(err);
    }
})

// ! get last group messages
// ? GET /chat/last-group-messages
const getLastGroupMessages = asyncHandler(async (req, res) => {
    try {
        const pipeline = [
            {
                $sort: { createdAt: -1 },
            },
            {
                $group: {
                    _id: "$groupId",
                    lastMessage: { $first: "$$ROOT" },
                },
            },
            {
                $replaceRoot: { newRoot: "$lastMessage" },
            },
        ];

        const lastGroupMessages = await GroupMessages.aggregate(pipeline);
        res.status(200).json(lastGroupMessages);
    } catch (err) {
        res.status(500).json(err);
    }
})



module.exports = {
    getGroups,
    getLastGroupMessages,
    addGroup,
    addGroupMessage,
    getGroupMessages,
    getGroupMembers
}