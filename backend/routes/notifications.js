const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead } = require('../controllers/notificationController');
const auth = require('../middleware/auth');
const notifications = require('../notifications');

router.get('/my', auth.protect, getMyNotifications);
router.post('/:id/read', auth.protect, markAsRead);

// Dev-only test endpoint to emit a sample notification (enabled when NODE_ENV !== 'production')
router.post('/test', (req, res) => {
	if (process.env.NODE_ENV === 'production') return res.status(404).json({ message: 'Not found' });
	const { type = 'deadline', message = 'Test notification', userIds = [] } = req.body || {};
	try {
		if (type === 'deadline') {
			notifications.emitDeadlineAlert({ message }, userIds);
		} else if (type === 'doubt') {
			notifications.emitNewDoubt({ question: message });
		} else if (type === 'topic') {
			notifications.emitNewTopic({ title: message }, 'test-course-id');
		} else {
			notifications.emitNewCourse({ title: message });
		}
		return res.json({ ok: true });
	} catch (e) {
		console.error('Test emit error', e);
		return res.status(500).json({ ok: false, error: e.message });
	}
});

module.exports = router;
