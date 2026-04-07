const express = require('express');
const { body, param } = require('express-validator');
const {
  getExams,
  createExam,
  updateExam,
  deleteExam,
} = require('../controllers/examController');
const authenticate = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// All exam routes require a valid JWT
router.use(authenticate);
router.use(generalLimiter);

const examValidation = [
  body('course')
    .trim()
    .notEmpty().withMessage('Course name is required')
    .isLength({ max: 255 }),
  body('course_id')
    .trim()
    .notEmpty().withMessage('Course ID is required')
    .isLength({ max: 50 }),
  body('day')
    .trim()
    .notEmpty().withMessage('Day is required')
    .isLength({ max: 20 }),
  body('time')
    .trim()
    .notEmpty().withMessage('Time is required')
    .isLength({ max: 20 }),
  body('room')
    .trim()
    .notEmpty().withMessage('Room is required')
    .isLength({ max: 100 }),
  body('date')
    .isISO8601().withMessage('A valid date is required')
    .toDate(),
];

const idValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid exam ID'),
];

router.get('/', getExams);
router.post('/', examValidation, createExam);
router.put('/:id', [...idValidation, ...examValidation], updateExam);
router.delete('/:id', idValidation, deleteExam);

module.exports = router;
