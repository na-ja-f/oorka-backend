let mongoose = require('mongoose')

const messageSchema = mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String
    },
    attachment: {
        type: {
            type: String,
            enum: ['image', 'video', 'file', 'audio'],
        },
        url: String,
        filename: String,
        size: Number,
    },
})

module.exports = mongoose.model("GroupMessages", messageSchema)