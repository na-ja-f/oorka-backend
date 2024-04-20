const express = require('express')
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware')
const { addPost,
    getPosts,
    deletePost,
    updatePost } = require('../controllers/postController')

router.post('/add-post', protect, addPost)
router.post('/get-post', protect, getPosts)
router.post("/delete-post", protect, deletePost)
router.put("/edit-post", protect, updatePost)

module.exports = router