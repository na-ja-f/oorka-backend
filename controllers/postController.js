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
    } = req.body

    if (!userId || !imageUrls) {
        res.status(400)
        throw new Error("fill all fields")
    }

    const post = await Post.create({
        userId,
        imageUrl: imageUrls,
        description
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
        }).sort({ date: -1 })

    res.status(200).json(posts)
})

// ! delete posts
// ? Post /post/delete-post
const deletePost = asyncHandler(async (req, res) => {
    const { postId, userId } = req.body
    const post = await Post.findById(postId)
    // console.log(post);
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
    const { userId, description } = req.body
    const post = await Post.findById(postId)

    if (description) {
        post.description = description
    }

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



module.exports = {
    addPost,
    getPosts,
    deletePost,
    updatePost,
    getUserPost
}