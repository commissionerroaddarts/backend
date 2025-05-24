import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        // required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    link: {
        type: String,
        default: undefined
    },
}, {
    timestamps: true 
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
