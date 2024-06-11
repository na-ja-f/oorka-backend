// ! module imports
const asyncHandler = require('express-async-handler')
// ! models
const User = require('../models/userModel')
const Connections = require('../models/connectionModel')
const createNotification = require('../helpers/notificationHelper')
const Notification = require('../models/notificationModel')

// ! get user connections
// ? POST /get-connection
const getConnections = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    const connection = await Connections.findOne({ userId }).populate({
        path: "followers",
        select: "name profileImg isVerified"
    })
        .populate({
            path: "following",
            select: "name profileImg isVerified"
        })
    res.status(200).json({ connection })
})

// ! follow user
// ? POST /follow
const followUser = asyncHandler(async (req, res) => {
    const { userId, followingUser } = req.body;

    const followingUserInfo = await User.findById(followingUser)
    let followed = false
    if (!followingUserInfo) {
        res.status(400)
        throw new Error("user not found")
    }

    if (followingUserInfo.isPrivate) {
        await Connections.findOneAndUpdate(
            { userId: followingUser },
            { $addToSet: { requested: userId } },
            { upsert: true }
        )
        await Connections.findOneAndUpdate(
            { userId },
            { $addToSet: { requestSent: followingUser } },
            { upsert: true }
        )

        const newNotification = new Notification({
            senderId: userId,
            receiverId: followingUser,
            message: 'requested to Follow',
            link: `/users-profile/${followingUser}/`,
            read: false,
        });

        await newNotification.save();

    } else {
        await Connections.findOneAndUpdate(
            { userId: followingUser },
            { $addToSet: { followers: userId } },
            { upsert: true }
        )
        await Connections.findOneAndUpdate(
            { userId },
            { $addToSet: { following: followingUser } },
            { upsert: true }
        )
        followed = true;
        
        const newNotification = new Notification({
            senderId: userId,
            receiverId: followingUser,
            message: 'Started Following you',
            link: `/visit-profile/posts/`,
            read: false,
        });

        await newNotification.save();

    }


    res.status(200).json({ success: true, message: "User followed succesfully", followed })

})

// ! un-follow user
// ? POST /unfollow
const unFollowUser = asyncHandler(async (req, res) => {
    const { userId, unfollowingUser } = req.body;
    console.log(req.body);
    await Connections.findOneAndUpdate(
        { userId: unfollowingUser },
        { $pull: { followers: userId, requestSent: userId } }
    )

    await Connections.findOneAndUpdate(
        { userId },
        { $pull: { following: unfollowingUser, requested: unfollowingUser } }
    )

    let a = await Connections.findById(unfollowingUser)
    console.log("it is", a);

    res.status(200).json({ success: true, message: "User unfollowed succesfully" })

})

// ! accept request
// ? POST /accept-request
const acceptRequest = asyncHandler(async (req, res) => {
    const { userId, requestedUser } = req.body;

    await Connections.findOneAndUpdate(
        { userId },
        {
            $pull: { requested: requestedUser },
            $addToSet: { followers: requestedUser }
        },
        { new: true }
    )
    await Connections.findOneAndUpdate(
        { userId: requestedUser },
        {
            $pull: { requestSent: userId },
            $addToSet: { following: userId }
        },
        { new: true }
    )
    const notificationData = {
        senderId: userId,
        receiverId: requestedUser,
        message: 'accepted your request',
        link: `/visit-profile/posts/`,
        read: false,

    };

    createNotification(notificationData)

    const connections = await Connections.findOne({ userId })
        .populate({
            path: 'requested',
            select: "name profileImg isVerified"
        })

    res.status(200).json({ success: true, message: "request accepted", connections: connections?.requested })

})

// ! reject request
// ? POST /reject-request
const rejectRequest = asyncHandler(async (req, res) => {
    const { userId, requestedUser } = req.body;

    await Connections.findOneAndUpdate(
        { userId },
        {
            $pull: { requested: requestedUser },
        },
        { new: true }
    )
    await Connections.findOneAndUpdate(
        { userId: requestedUser },
        {
            $pull: { requestSent: userId },
        },
        { new: true }
    )

    const connections = await Connections.findOne({ userId })
        .populate({
            path: 'requested',
            select: "name profileImg isVerified"
        })

    res.status(200).json({ success: true, message: "request rejected", connections: connections?.requested })

})

// ! get requested users
// ? POST /get-requested-users
const getRequestedUsers = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    const requests = await Connections.findOne({ userId })
        .populate({
            path: 'requested',
            select: "name profileImg isVerified"
        })

    res.status(200).json({ requests: requests?.requested })

})

module.exports = {
    getConnections,
    followUser,
    unFollowUser,
    acceptRequest,
    rejectRequest,
    getRequestedUsers
}
