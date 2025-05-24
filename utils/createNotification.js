import Notification from "../models/Notification.js";


export const createNotification = async ({ userId, title, message, link }) => {
    try {
        const notification = new Notification({
            userId,
            title,
            message,
            link
        });

        console.log("new notification Created")
        return await notification.save();
    } catch (error) {
        console.error('Error creating notification:', error);
        // throw new Error('Notification could not be created');
    }
};
