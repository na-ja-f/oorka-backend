const express = require('express')
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware')
const {
    addStoryController,
    getStories,
    getUserStory,
    readStory
} = require('../controllers/storyController')

router.post('/add-story', protect, addStoryController)
router.get("/get-stories/:userId", protect, getStories);
router.get("/get-user-story/:userId", getUserStory);
router.patch("/read-story", protect, readStory);

module.exports = router