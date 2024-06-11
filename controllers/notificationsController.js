const Notification = require('../models/notificationModel')

const getNotifications = async (req, res) => {
    try {
        const userId = req.body.userId;
        const notifications = await Notification.find({ receiverId: userId }).populate({
            path: 'senderId',
            select: 'name profileImg'
        }).sort({ createdAt: -1 })
        res.status(200).json({ notifications: notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
}

module.exports = {
    getNotifications
}