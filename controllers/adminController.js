const Admin = require('../models/adminModel')
const generateToken = require('../utils/generateToken')
const User = require('../models/userModel')
const Post = require('../models/postModel')
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
    const  userId  = req.body.userId
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



module.exports = {
    login,
    getUsers,
    userBlock
}
