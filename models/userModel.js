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
        default: 0
    },
    password: {
        type: String,
        required: true,
    },
    profileImg: {
        type: String,
        default: 'https://as1.ftcdn.net/v2/jpg/03/46/83/96/1000_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg'
    },
    bio: {
        type: String,
        default: ""
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
    premiumExpiryDate: {
        type: Date,
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
    lastSeen: {
        type: Date,
    },
},
    {
        timestamps: true
    })

module.exports = mongoose.model('User', userSchema)