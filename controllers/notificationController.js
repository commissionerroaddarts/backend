import Notification from "../models/Notification.js";

export const getUsersNotification = async (req, res) => {
    try {
        let userId = req.user.id;

        if(req.query.all){
            userId = undefined
        }
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [notifications, totalItems] = await Promise.all([
            Notification.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            Notification.countDocuments({ userId })
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        res.status(200).json({
            data: notifications,
            totalItems,
            totalPages,
            page,
            limit
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);

        res.status(500).json({
            message: 'Server error while fetching notifications'
        });
    }
};


export const markNotificationsAsRead = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Please provide notification IDs' });
    }

    const result = await Notification.updateMany(
      { _id: { $in: ids } },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      message: `${result.modifiedCount} notification(s) marked as read`
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({
      message: 'Server error while marking notifications as read'
    });
  }
};