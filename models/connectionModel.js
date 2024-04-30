let mongoose = require('mongoose')

const connectionSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    followers: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", }],
        default: []
    },
    following: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", }],
        default: []
    },
    requested: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", }],
        default: []
    },
    requestSent: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", }],
        default: []
    },
    
})

module.exports = mongoose.model("Connections",connectionSchema)