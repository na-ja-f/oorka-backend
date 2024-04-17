const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')


const registerValidation = asyncHandler(async (req, res, next) => {
    try {
        const { username, email, password } = req.body

        const trimmedUsername = username.trim();
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedUsername || !trimmedEmail || !trimmedPassword) {
            res.status(400);
            throw new Error("Please fill all the forms");
        }

        const userExist = await User.findOne({ email: trimmedEmail });
        if (userExist) {
            res.status(400);
            throw new Error("User already Exist");
        }

        next();

    } catch (error) {
        console.log(error);
        res.status(401);
        throw new Error("Not authenticated");
    }
})

const otpValidation = asyncHandler(async (req, res, next) => {
    try {
        const { otp } = req.body
        if (!otp) {
            res.status(400)
            throw new Error("please provide otp")
        }
        next();
    } catch (error) {
        console.log(error);
        res.status(401);
        throw new Error("Not authenticated");
    }
})

const userLoginValidation = asyncHandler(
    async (req, res, next) => {
      try {
        const { email, password } = req.body;
        if (!email.trim() || !password.trim()) {
          res.status(400);
          throw new Error("Please add fields");
        }
        const user = await User.findOne({ email });
  
        if (user) {
          if (user.isBlocked) {
            res.status(400);
            throw new Error("User is blocked");
          }
        }
        if (!user) {
          res.status(400);
          throw new Error("User not found");
        }
  
        next();
      } catch (error) {
        console.log(error);
        res.status(401);
        throw new Error("Not User found");
      }
    }
  );



module.exports = {
    registerValidation,
    otpValidation,
    userLoginValidation
}