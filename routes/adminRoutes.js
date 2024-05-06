const express = require('express')
const router = express.Router()
const {
    login,
    getUsers,
    userBlock,
    getPostReports,
    postBlock,
    adminGetPosts
} = require('../controllers/adminController')
const { protectAdmin } = require('../middlewares/adminAuth')

router.post('/login', login)
router.get('/get-users', protectAdmin, getUsers)
router.post('/user-block', protectAdmin, userBlock)
router.get('/get-reports', protectAdmin, getPostReports)
router.put('/post-block', protectAdmin, postBlock)
router.get('/get-posts', protectAdmin, adminGetPosts)

module.exports = router