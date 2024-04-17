const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: Number,
    },
    password: {
        type: String,
        required: true,
    },
    profileImg: {
        type: String,
    },
    bio: {
        type: String,
    },
    savedPost: {
        type: Array,
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    isGoogle: {
        type: Boolean,
        default: false
    }, 
},
    {
        timestamps: true
    })

module.exports = mongoose.model('User', userSchema)