// ! module imports
const asyncHandler = require('express-async-handler')
// ! models
const Post = require('../models/postModel')
const User = require('../models/userModel')
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
        .sort({date: -1})

        res.status(200).json({message:"Post added succesfully", posts})

})

module.exports = {
    addPost,
}