const mongoose = require("mongoose")

const postSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    imageUrl: {
        type: [String],
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    date: {
        type: Date,
        default: Date.now()
    },
    hashtags: {
        type: [String],
        default: []
    },
    likes: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        default: []
    },
    isHidden: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    hideComment: {
        type: Boolean,
        default: false
    },
    hideLikes: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
},
    {
        timestamps: true
    })

module.exports = mongoose.model('Post', postSchema)