let mongoose = require('mongoose')

const messageSchema = mongoose.Schema({
    conversationId: {
        type: String,
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
        required: true
    },
    attachment: {
        type: {
            type: String,
            enum: ['image', 'video', 'file', 'audio']
        },
        url: String,
        filename: String,
        size: Number
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model("Message", messageSchema)