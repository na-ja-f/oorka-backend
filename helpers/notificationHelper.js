const Notification = require('../models/notificationModel')

const createNotification = async (args) => {
    try {
        console.log('recieved');
        const {
            senderId,
            receiverId,
            message,
            link,
            read = false,
            postId,
        } = args;
        console.log('this is',args);

        const newNotification = new Notification({
            senderId,
            receiverId,
            message,
            link,
            read,
            postId,
        });

        const savedNotification = await newNotification.save();
        return savedNotification;
    } catch (error) {
        throw new Error('Error creating notification');
    }
}

module.exports = {
    createNotification
}