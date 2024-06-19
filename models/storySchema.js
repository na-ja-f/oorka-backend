let mongoose = require('mongoose')


const storySchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    stories: [{
        imageUrl: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        views: {
            type: [String],
            default: []
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        isVideo: {
            type: Boolean,
            default: false
        },
    }],
}, { timestamps: true })

storySchema.index({ 'stories.createdAt': 1 }, { expireAfterSeconds: 24 * 60 * 60 })

module.exports = mongoose.model("Story", storySchema)