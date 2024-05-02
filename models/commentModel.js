let mongoose = require('mongoose')

const ReplyCommentSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    replyComment: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
})

const CommentSchema = mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    replyComments: [ReplyCommentSchema]


}, { timestamps: true })

module.exports = mongoose.model("Comment", CommentSchema)