const Admin = require('../models/adminModel')
const generateToken = require('../utils/generateToken')
const User = require('../models/userModel')
const Post = require('../models/postModel')
const Report = require('../models/reportModel')
const asyncHandler = require("express-async-handler");

// ! login
// ? /admin/login
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const admin = await Admin.findOne({ email })

    if (admin && password === admin.password) {
        res.status(200).json({
            message: "login successfull",
            _id: admin.id,
            name: admin.name,
            email: admin.email,
            profileImg: admin.profileImg,
            token: generateToken(admin.id)
        })
    } else {
        res.status(400)
        throw new Error("invalid credentials")
    }
})

// ! get all users
// ? /admin/get-users
const getUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.page) || 10

    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    const totalUsers = await User.countDocuments({})

    const users = await User.find({})
        .sort({ date: -1 })
        .limit(limit)
        .skip(startIndex)

    const pagination = {}

    if (endIndex < totalUsers) {
        pagination.next = {
            page: page + 1,
            limit: limit
        }
    }

    if (startIndex < 0) {
        pagination.prev = {
            page: page - 1,
            limit: limit
        }
    }

    if (users) {
        res.status(200).json({ users, pagination, totalUsers })
    } else {
        res.status(400)
        throw new Error("users not found")
    }
})

// ! block user
// ? /admin/get-users
const userBlock = asyncHandler(async (req, res) => {
    const userId = req.body.userId
    const user = await User.findById(userId)

    if (!user) {
        res.status(400)
        throw new Error("user not found")
    }

    user.isBlocked = !user.isBlocked
    await user.save()

    const users = await User.find({}).sort({ date: -1 })
    const blocked = user.isBlocked ? "Blocked" : "unblocked"
    res.status(200).json({ users, message: `you have ${blocked} ${user.name}` })
})

// ! report post
// ? /admin/get-users
const getPostReports = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalReports = await Report.countDocuments({});

    const reports = await Report.find({})
        .populate({
            path: "userId",
            select: "name profileImg isVerified",
        })
        .populate("postId")
        .sort({ date: -1 })
        .limit(limit)
        .skip(startIndex);

    const pagination = {};

    if (endIndex < totalReports) {
        pagination.next = {
            page: page + 1,
            limit: limit,
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit: limit,
        };
    }

    if (reports) {
        res.status(200).json({ reports, pagination, totalReports });
    } else {
        res.status(404);
        throw new Error(" No Post Found");
    }
})
// ! get blocked posts
// ? /admin/get-posts
const adminGetPosts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalPosts = await Post.countDocuments({ isBlocked: true });

    const posts = await Post.find({ isBlocked: true })
        .populate({
            path: "userId",
            select: "userName profileImg isVerified",
        })
        .sort({ date: -1 })
        .limit(limit)
        .skip(startIndex);
    const pagination = {};

    if (endIndex < totalPosts) {
        pagination.next = {
            page: page + 1,
            limit: limit,
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit: limit,
        };
    }

    if (posts) {
        res.status(200).json({ posts, pagination, totalPosts });
    } else {
        res.status(404);
        throw new Error(" No Post Found");
    }
})

// ! block user
// ? /admin/get-users
const postBlock = asyncHandler(async (req, res) => {
    const postId = req.body.postId;
    console.log('ia ', postId);
    const post = await Post.findById(postId);
    if (!post) {
        res.status(400);
        throw new Error("User not found");
    }

    post.isBlocked = !post.isBlocked;
    await post.save();

    const posts = await Post.find({}).sort({ date: -1 });
    const blocked = post.isBlocked ? "Blocked" : "Unblocked";

    res.status(200).json({ posts, message: `You have ${blocked} the post` });
})



module.exports = {
    login,
    getUsers,
    userBlock,
    getPostReports,
    postBlock,
    adminGetPosts
}
