let mongoose = require('mongoose')

const groupSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    members: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
        default: Date.now()
    },
    description: {
        type: String,
    },
    admins: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    profile: {
        type: String,
    },
})

module.exports = mongoose.model("GroupChat", groupSchema)