const Admin = require('../models/adminModel')
const generateToken = require('../utils/generateToken')
const User = require('../models/userModel')
const Post = require('../models/postModel')
const asyncHandler =  require("express-async-handler");

const login = asyncHandler(async(req, res) => {
    const {email, password} = req.body
    const admin = await Admin.findOne({email})

    if(admin && password === admin.password) {
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

module.exports = {
    login
}
