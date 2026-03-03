const Notification = require('../models/Notification');

// Get notifications for current user
exports.getMyNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('sender', 'name email');

    const total = await Notification.countDocuments({ recipient: req.user._id });

    res.json({ notifications, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (error) {
    console.error('Error fetching notifications', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findById(id);
    if (!notif) return res.status(404).json({ message: 'Notification not found' });
    if (notif.recipient.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    notif.read = true;
    await notif.save();
    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Error marking notification read', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
};
