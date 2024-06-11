const express = require('express')
const router = express.Router();
// ! auth middleware
const { protect } = require('../middlewares/authMiddleware')
// ! controllers
const { registerUser,
    verifyOTP,
    resendOtp,
    googleAuth,
    loginUser,
    forgotPassword,
    forgotPasswordOtp,
    resetPassword,
    getUserDetails,
    editProfile,
    searchedUser,
    getHashtags,
    userSuggestions,
} = require('../controllers/userController')
const { getPremiumUserData, initialCheckout, validatePayment } = require('../controllers/checkoutController')
const { getNotifications } = require('../controllers/notificationsController')
// ! validations
const { registerValidation, otpValidation, userLoginValidation } = require('../validations/userValidations')

router.post('/register', registerValidation, registerUser)
router.post('/register-otp', otpValidation, verifyOTP)
router.post('/resend-otp', resendOtp)
router.post('/google-auth', googleAuth)
router.post('/login', userLoginValidation, loginUser)
router.post('/forgot-password', forgotPassword)
router.post('/forgot-otp', forgotPasswordOtp)
router.post('/reset-password', resetPassword)
router.get('/user-details/:userId', getUserDetails)
router.patch('/edit-profile', editProfile)
router.post('/search-users', searchedUser)
router.get("/get-hashtags", getHashtags);
router.post("/user-suggestions",userSuggestions);


router.post('/get-transactions', getPremiumUserData)
router.post('/checkout-user', initialCheckout)
router.post('/validate-payment', validatePayment)

router.post("/get-notifications", getNotifications);


module.exports = router