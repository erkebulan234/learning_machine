const router = require('express').Router();
const { getLessonById, createLesson, updateLesson, deleteLesson } = require('../controllers/lessonController');
const { authenticate, optionalAuthenticate } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/:id',    optionalAuthenticate, getLessonById);
router.post('/',      authenticate, adminOnly, createLesson);
router.put('/:id',    authenticate, adminOnly, updateLesson);
router.delete('/:id', authenticate, adminOnly, deleteLesson);

module.exports = router;