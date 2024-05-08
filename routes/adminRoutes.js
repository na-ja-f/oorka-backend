const express = require('express')
const router = express.Router()
const {
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
} = require('../controllers/adminController')
const { protectAdmin } = require('../middlewares/adminAuth')

router.post('/login', login)
router.get('/get-users', protectAdmin, getUsers)
router.post('/user-block', protectAdmin, userBlock)
router.get('/get-reports', protectAdmin, getPostReports)
router.put('/post-block', protectAdmin, postBlock)
router.get('/get-posts', protectAdmin, adminGetPosts)
router.get('/transactions', protectAdmin, getTransactions)

router.get("/hashtags", protectAdmin, getHashtags);
router.post("/add-hashtag", protectAdmin, addHashtags);
router.put("/block-hashtag", protectAdmin, blockHashtags);
router.patch("/edit-hashtag", editHashtag);

router.get('/chart-data', protectAdmin, chartData);
router.get('/dashboard-stats', protectAdmin, dashboardStats);

module.exports = router