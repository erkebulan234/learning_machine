const router = require('express').Router();
const { getTaskById, createTask, submitTask } = require('../controllers/taskController');
const { authenticate } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/:id',         getTaskById);
router.post('/',          authenticate, adminOnly, createTask);
router.post('/:id/submit', authenticate, submitTask);

module.exports = router;