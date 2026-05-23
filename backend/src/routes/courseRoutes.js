// routes/courses.js
const router = require('express').Router();
const {
  getAllCourses, getCourseById,
  createCourse, updateCourse, deleteCourse
} = require('../controllers/coursesController');
const { authenticate } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');


router.get('/',     getAllCourses);
router.get('/:id',  getCourseById);
router.post('/',    authenticate, adminOnly, createCourse);
router.put('/:id',  authenticate, adminOnly, updateCourse);
router.delete('/:id', authenticate, adminOnly, deleteCourse);

module.exports = router;