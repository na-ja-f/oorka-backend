let mongoose = require('mongoose')

const conversationSchema = mongoose.Schema({
    members: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        required: true
    },
    isGroup: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model("Conversation", conversationSchema)