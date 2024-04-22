const express = require('express')
const router = express.Router()

const { login,
    getUsers,
    userBlock } = require('../controllers/adminController')
const { protectAdmin } = require('../middlewares/adminAuth')

router.post('/login', login)
router.get('/get-users', protectAdmin, getUsers)
router.post('/user-block', protectAdmin, userBlock)

module.exports = router