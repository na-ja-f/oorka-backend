const express = require('express')
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware')
const { addPost } = require('../controllers/postController')

router.post('/add-post', protect, addPost)

module.exports = router