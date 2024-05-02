const asyncHandler = require('express-async-handler')
const Comment = require('../models/commentModel')
const Post = require('../models/postModel')


// ! get comments count
// ? GET post/comments-count
const getCommentsCount = asyncHandler(async (req, res) => {
    const postId = req.params.postId

    const commentsCount = await Comment.countDocuments({
        postId,
        isDeleted: false
    })
    res.status(200).json(commentsCount)
})

// ! get comments of a post
// ? GET post/get-comments
const getComments = asyncHandler(async (req, res) => {
    const postId = req.params.postId

    const comments = await Comment.find({ postId:postId, isDeleted: false })
        .populate({ path: "userId", select: "name profileImg" })
        .populate({ path: "replyComments.userId", select: "name profileImg" })
        .sort({ createdAt: -1 })

    res.status(200).json({comments})
})

// ! add comment
// ? POST post/add-comment
const addComment = asyncHandler(async (req, res) => {
    const { postId, userId, comment } = req.body

    const newComment = await Comment.create({ postId, userId, comment })

    await newComment.save();
    const comments = await Comment.find({ postId, isDeleted: false })
        .populate({ path: "userId", select: "name profileImg" })
        .populate({ path: "replyComments.userId", select: "name profileImg" })

    res.status(200).json({ message: 'commented', comments })
})

// ! reply comment
// ? POST post/reply-comment
const replyComment = asyncHandler(async (req, res) => {
    const { commentId, userId, replyComment } = req.body

    const comment = await Comment.findById(commentId)
    if (!comment) {
        res.status(404)
        throw new Error('comment not found')
    }

    const newReplyComment = {
        userId,
        replyComment,
        timestamp: new Date()
    }

    comment.replyComments.push(newReplyComment)
    await comment.save();

    const comments = await Comment.find({ postId: comment.postId, isDeleted: false })
        .populate({ path: "userId", select: "name profileImg" })
        .populate({ path: "replyComments.userId", select: "name profileImg" })

    res.status(200).json({ message: 'reply added', comments })
})

// ! delete comment
// ? DELETE post/delete-comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.body

    const comment = await Comment.findById(commentId)
    if (!comment) {
        res.status(404)
        throw new Error('comment not found')
    }

    comment.isDeleted = true
    await comment.save();

    const comments = await Comment.find({ postId: comment.postId, isDeleted: false })
        .populate({ path: "userId", select: "name profileImg" })
        .populate({ path: "replyComments.userId", select: "name profileImg" })
        .sort({ createdAt: -1 })

    res.status(200).json({ message: 'comment deleted', comments })
})


module.exports = {
    getCommentsCount,
    getComments,
    addComment,
    replyComment,
    deleteComment
}