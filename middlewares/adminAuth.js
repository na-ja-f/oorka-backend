const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const Admin = require('../models/adminModel')

const protectAdmin = asyncHandler(async (req, res, next) => {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // ? get token from header
            token = req.headers.authorization.split(' ')[1]
            // ? verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            // ?get user from token
            req.admin = await Admin.findById(decoded.id).select('-password')

            next()
        } catch (error) {
            console.log(error);
            res.status(401)
            throw new Error('not authorized')
        }
    }
    if (!token) {
        res.status(401)
        throw new Error('not authorized and no token')
    }
})

module.exports = { protectAdmin }