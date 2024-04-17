const express = require('express')
const router = express.Router();
// ! auth middleware
const { protect } = require('../middlewares/authMiddleware')
// ! controllers
const { registerUser,
    verifyOTP,
    resendOtp,
    googleAuth,
    loginUser
} = require('../controllers/userController')
// ! validations
const { registerValidation, otpValidation, userLoginValidation } = require('../validations/userValidations')

router.post('/register', registerValidation, registerUser)
router.post('/register-otp', otpValidation, verifyOTP)
router.post('/resend-otp', resendOtp)
router.post('/google-auth', googleAuth)
router.post('/login', userLoginValidation, loginUser)


module.exports = router