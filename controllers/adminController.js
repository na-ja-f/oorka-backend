const Admin = require('../models/adminModel')
const generateToken = require('../utils/generateToken')
const User = require('../models/userModel')
const Post = require('../models/postModel')
const Report = require('../models/reportModel')
const Hashtag = require('../models/hashtagModel')
const Transactions = require('../models/transactionModel')
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

// ! transaction list
// ? /admin/get-users
const getTransactions = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalTransactions = await Transactions.countDocuments();

    const transactions = await Transactions.find()
        .populate({
            path: "userId",
            select: "name profileImg isVerified",
        })
        .sort({ startDate: -1 })
        .limit(limit)
        .skip(startIndex);

    const pagination = {};

    if (endIndex < totalTransactions) {
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

    if (transactions) {
        res.status(200).json({ transactions, pagination, totalTransactions });
    } else {
        res.status(404);
        throw new Error("No transactions found");
    }
})


// ! add Hashtags
// ? /admin/add-hashtags
const addHashtags = asyncHandler(async (req, res) => {
    const { hashtag } = req.body;

    const existingHashtags = await Hashtag.find({ hashtag });
    if (existingHashtags.length > 0) {
        res.status(404);
        throw new Error("Hashtag Already Exist");
    }

    await Hashtag.create({ hashtag });
    const allTags = await Hashtag.find({}).sort({ date: -1 });

    res.status(200).json({ message: "Hashtag added", hashtags: allTags });

})

// ! get Hashtags
// ? /admin/hashtags
const getHashtags = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalHashtags = await Hashtag.countDocuments({});

    const hashtags = await Hashtag.find({})
        .sort({ date: -1 })
        .limit(limit)
        .skip(startIndex);

    const pagination = {};
    if (endIndex < totalHashtags) {
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

    if (hashtags) {
        res.status(200).json({ hashtags, pagination, totalHashtags });
    } else {
        res.status(404);
        throw new Error(" No Hashtags Found");
    }

})

// ! block Hashtags
// ? /admin/block-hashtag
const blockHashtags = asyncHandler(async (req, res) => {
    const hashtagId = req.body.hashtagId;

    const hashtag = await Hashtag.findById(hashtagId);
    if (!hashtag) {
        res.status(400);
        throw new Error("Hashtag not found");
    }

    hashtag.isBlocked = !hashtag.isBlocked;
    await hashtag.save();

    const hashtags = await Hashtag.find({}).sort({ date: -1 });
    const blocked = hashtag.isBlocked ? "Blocked" : "Unblocked";

    res.status(200).json({ hashtags, message: `You have ${blocked} ${hashtag.hashtag}` });
})

// ! edit Hashtags
// ? /admin/edit-hashtag
const editHashtag = asyncHandler(async (req, res) => {
    const { hashtagId, hashtag } = req.body;

    const ExistingTag = await Hashtag.findById(hashtagId);
    if (!ExistingTag) {
        res.status(400);
        throw new Error("Hashtag not found");
    }

    ExistingTag.hashtag = hashtag;
    await hashtag.save();
    const hashtags = await Hashtag.find({}).sort({ date: -1 });

    res.status(200).json({ hashtags, message: `You have Edited hashtag` });
})

// ! edit Hashtags
// ? /admin/edit-hashtag
const dashboardStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const blockedPosts = await Post.countDocuments({ isBlocked: true });
    const totalSales = await Transactions.countDocuments();
    const totalHashtags = await Hashtag.countDocuments();
    const totalReports = await Report.countDocuments();
    const stats = {
      totalUsers,
      totalPosts,
      blockedPosts,
      totalSales,
      totalHashtags,
      totalReports,
    };

    res.status(200).json(stats);
})

// ! dashboard chart data
// ? /admin/chart-data
const chartData = asyncHandler(async (req, res) => {
    const userJoinStats = await User.aggregate([
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                userCount: { $sum: 1 },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);

    const postCreationStats = await Post.aggregate([
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                postCount: { $sum: 1 },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);

    const chartData = { userJoinStats, postCreationStats, };

    res.json(chartData);
})



module.exports = {
    login,
    getUsers,
    userBlock,
    getPostReports,
    postBlock,
    adminGetPosts,
    getTransactions,
    addHashtags,
    getHashtags,
    blockHashtags,
    editHashtag,
    dashboardStats,
    chartData
}
