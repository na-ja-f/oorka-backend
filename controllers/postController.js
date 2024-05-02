// ! module imports
const asyncHandler = require('express-async-handler')
// ! models
const Post = require('../models/postModel')
const User = require('../models/userModel')
const Connections = require('../models/connectionModel')
// ! helpers imports
const generateToken = require('../utils/generateToken')


// ! create a post
// ? POST /post/add-post
const addPost = asyncHandler(async (req, res) => {
    const {
        userId,
        imageUrls,
        description,
        hideLikes,
        hideComment,
    } = req.body

    if (!userId || !imageUrls) {
        res.status(400)
        throw new Error("fill all fields")
    }

    const post = await Post.create({
        userId,
        imageUrl: imageUrls,
        description,
        hideComment,
        hideLikes,
    })

    if (!post) {
        res.status(400)
        throw new Error("cannot add post")
    }
    const posts = await Post.find()
        .populate({
            path: "userId",
            select: "name profileImg isVerified",
        })
        .sort({ date: -1 })

    res.status(200).json({ message: "Post added succesfully", posts })

})

// ! gwt all posts
// ? GET /post/get-post
const getPosts = asyncHandler(async (req, res) => {
    const { userId } = req.body

    const connections = await Connections.findOne({ userId }, { following: 1 })
    const followingUsers = connections?.following


    const usersQuery = { _id: { $in: followingUsers } };
    const users = await User.find(usersQuery)
    const userIds = users.map((user) => user._id)

    const postsQuery = {
        userId: { $in: [...userIds, userId] },
        isBlocked: false,
        isDeleted: false
    }


    const posts = await Post.find(postsQuery)
        .populate({
            path: "userId",
            select: "name profileImg isVerified"
        })
        .populate({
            path: "likes",
            select: "name profileImg isVerified"
        }).sort({ date: -1 })
    res.status(200).json(posts)
})

// ! delete posts
// ? Post /post/delete-post
const deletePost = asyncHandler(async (req, res) => {
    const { postId, userId } = req.body
    const post = await Post.findById(postId)
    post.isDeleted = true
    await post.save()
    const posts = await Post.find({ isDeleted: false })
        .populate({
            path: "userId",
            select: "name profileImg isVerified"
        }).sort({ date: -1 })
    res.status(200).json(posts)
})

// ! update posts
// ? PUT /post/update-post
const updatePost = asyncHandler(async (req, res) => {
    const postId = req.body.postId
    const { userId, description, hideComment, hideLikes } = req.body
    const post = await Post.findById(postId)

    if (description) {
        post.description = description
    }
    if (hideComment !== undefined) post.hideComment = hideComment;
    if (hideLikes !== undefined) post.hideLikes = hideLikes;

    await post.save()
    const posts = await Post.find({ isDeleted: false })
        .populate({
            path: "userId",
            select: "name profileImg isVerified"
        }).sort({ date: -1 })
    res.status(200).json(posts)
})

// ! get user posts
// ? get /post/get-post
const getUserPost = asyncHandler(async (req, res) => {
    const id = req.params.userId;

    const posts = await Post.find({ userId: id, isDeleted: false })
        .populate({
            path: "userId",
            select: "name profileImg isVerified"
        }).sort({ date: -1 })
    res.status(200).json(posts)
})

// ! like posts
// ? get /post/get-post
const likePost = asyncHandler(async (req, res) => {
    const { postId, userId } = req.body;
    const post = await Post.findById(postId)

    if (!post) {
        res.status(404)
        throw new Error("Post not found")
    }
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
        await Post.findOneAndUpdate(
            { _id: postId },
            { $pull: { likes: userId } },
            { new: true }
        )
    } else {
        await Post.findOneAndUpdate(
            { _id: postId },
            { $push: { likes: userId } },
            { new: true }
        )
    }

    const posts = await Post.find({
        userId: userId,
        isBlocked: false,
        isDeleted: false,
    })
        .populate({
            path: "userId",
            select: "name profileImg isVerified"
        })
        .sort({ date: -1 })

    res.status(200).json({ posts })
})

// ! save posts
// ? POST /post/save-post
const savePost = asyncHandler(async (req, res) => {
    const { postId, userId } = req.body;
    const user = await User.findById(userId)

    if (!user) {
        res.status(404)
        throw new Error("user not found")
    }
    const isSaved = user.savedPost.includes(postId);

    if (isSaved) {
        await User.findOneAndUpdate(
            { _id: userId },
            { $pull: { savedPost: postId } },
            { new: true }
        )
    } else {
        await User.findOneAndUpdate(
            { _id: userId },
            { $push: { savedPost: postId } },
            { new: true }
        )
    }

    const userData = await User.find({ userId: userId, isBlocked: false }).sort(
        { date: -1 }
    );
    res.status(200).json({
        _id: user.id,
        username: user.name,
        email: user.email,
        profileImg: user.profileImg,
        savedPost: user.savedPost,
        token: generateToken(user.id),
    });
})

// ! like posts
// ? get /post/get-post
const getSavedPost = asyncHandler(async (req, res) => {
    const id = req.params.userId
    const user = await User.findOne({ _id: id, isBlocked: false }, { savedPost: 1, _id: 0 })
    if (user) {
        const savedPostIds = user.savedPost;
        const posts = await Post.find({ _id: { $in: savedPostIds } })
            .populate("userId")
        res.status(200).json(posts)
    } else {
        res.status(400);
        throw new Error("User Not Found");
    }
})





module.exports = {
    addPost,
    getPosts,
    deletePost,
    updatePost,
    getUserPost,
    likePost,
    savePost,
    getSavedPost
}