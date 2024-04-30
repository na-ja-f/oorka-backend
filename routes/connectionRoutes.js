const express = require('express')
const router = express.Router()
const { getConnections, followUser, unFollowUser, acceptRequest, rejectRequest, getRequestedUsers } = require('../controllers/connectionController')

router.post('/follow', followUser)
router.post('/unfollow', unFollowUser)
router.post('/accept-request', acceptRequest)
router.post('/reject-request', rejectRequest)
router.post('/get-requested-users', getRequestedUsers)
router.post('/get-connection', getConnections)


module.exports = router