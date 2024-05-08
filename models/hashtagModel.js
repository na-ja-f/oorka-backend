let mongoose = require('mongoose')

const hashtagSchema = mongoose.Schema({
    hashtag: {
        type: String,
        required: true
    },
    posts: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Post",
        default: []
    },
    date: {
        type: Date,
        default: Date.now
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model("Hashtag", hashtagSchema)