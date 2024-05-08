const asyncHandler = require('express-async-handler')
const Connections = require('../models/connectionModel')
const User = require('../models/userModel')
const Story = require('../models/storySchema')

// ! add story
// ? POSt /story/add-story
const addStoryController = asyncHandler(async (req, res) => {
    const { userId, imageUrls } = req.body;

    let story = await Story.findOne({ userId });
    if (!story) {
        story = await Story.create({
            userId,
            stories: [{ imageUrl: imageUrls }],
        });
    } else {
        story.stories.push({ imageUrl: imageUrls, views: [] });
        await story.save();
    }

    let updatedStory = await Story.findOne({ userId }).populate({
        path: "userId",
        select: "name profileImg isVerified",
    });

    res.status(200).json(updatedStory);

})

// ! get all stories
// ? GET /story/get-stories
const getStories = asyncHandler(async (req, res) => {
    const userId = req.params.userId;

    const connections = await Connections.findOne({ userId }, { following: 1 });
    const followingUsers = connections?.following;
    const users = await User.find({
        $or: [{ _id: { $in: followingUsers } }],
    });
    const userIds = users.map((user) => user._id);

    const stories = await Story.find({
        userId: { $in: [...userIds] },
    })
        .populate({
            path: "userId",
            select: "name profileImg isVerified",
        })
        .sort({ createdAt: -1 });

    res.status(200).json(stories);

})

// ! get user stories
// ? GET /story/get-stories
const getUserStory = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    console.log(userId + "userStory")
    const story = await Story.findOne({
        userId: userId
    })
        .populate({
            path: "userId",
            select: "name profileImg isVerified",
        });

    console.log(story);
    res.status(200).json(story);

})

// ! get all stories
// ? GET /story/get-stories
const readStory = asyncHandler(async (req, res) => {
    const { storyId, userId } = req.body;
    const story = await Story.findById(storyId);
    if (!story) {
        res.status(400);
        throw new Error("Story not found");
    }
    story.stories.forEach((storyItem) => {
        if (!storyItem.views.includes(userId)) {
            storyItem.views.push(userId);
        }
    });
    await story.save();

    const updatedStory = await Story.findById(storyId).populate({
        path: "userId",
        select: "name profileImg isVerified",
    });
    res.status(200).json(updatedStory);

})



module.exports = {
    addStoryController,
    getStories,
    getUserStory,
    readStory
}