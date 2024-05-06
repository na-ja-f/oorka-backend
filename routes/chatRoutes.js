const express = require('express')
const router = express.Router()
const upload = require('../utils/multer/multer')
const {
    addConversation,
    getUserConversation,
    getLastMessages,
    getEligibleUsers,
    getUnreadMessages,
    addMessage,
    getMessages,
    setMessageRead
} = require('../controllers/chatController')
const {
    getGroups,
    getLastGroupMessages,
    addGroup,
    addGroupMessage,
    getGroupMessages
} = require('../controllers/groupChatController')

// * conversation
router.post('/add-conversation', addConversation)
router.get('/get-conversations/:userId', getUserConversation)

// * messages
router.post('/add-message', upload.single('file'), addMessage);
router.get('/get-messages/:conversationId', getMessages)
router.post('/chat-eligible-users', getEligibleUsers)
router.get('/get-last-messages/', getLastMessages)
router.patch('/set-message-read', setMessageRead);
router.post('/get-unread-messages', getUnreadMessages)



// * group chat
router.post('/add-chat-group', addGroup);
router.get('/get-groups/:userId', getGroups)

// * group messages
router.post('/add-group-message',upload.single('file'), addGroupMessage)
router.get('/get-group-messages/:groupId', getGroupMessages)
router.get('/last-group-messages/', getLastGroupMessages)





module.exports = router