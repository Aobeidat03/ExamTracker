const { validationResult } = require('express-validator');
const db = require('../db');

// All queries filter by req.user.id — a student can never touch another student's data.

const getExams = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, course, course_id, day, time, room, date, created_at
         FROM exams
        WHERE user_id = $1
        ORDER BY date ASC, time ASC`,
      [req.user.id]
    );
    res.json({ exams: result.rows });
  } catch (err) {
    console.error('Get exams error:', err);
    res.status(500).json({ error: 'Failed to fetch exams.' });
  }
};

const createExam = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { course, course_id, day, time, room, date } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO exams (user_id, course, course_id, day, time, room, date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, course, course_id, day, time, room, date, created_at`,
      [req.user.id, course, course_id, day, time, room, date]
    );
    res.status(201).json({ exam: result.rows[0] });
  } catch (err) {
    console.error('Create exam error:', err);
    res.status(500).json({ error: 'Failed to create exam.' });
  }
};

const updateExam = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { course, course_id, day, time, room, date } = req.body;

  try {
    const result = await db.query(
      `UPDATE exams
          SET course = $1, course_id = $2, day = $3, time = $4,
              room = $5, date = $6, updated_at = NOW()
        WHERE id = $7 AND user_id = $8
        RETURNING id, course, course_id, day, time, room, date, created_at`,
      [course, course_id, day, time, room, date, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'Exam not found or you do not have permission to edit it.' });
    }

    res.json({ exam: result.rows[0] });
  } catch (err) {
    console.error('Update exam error:', err);
    res.status(500).json({ error: 'Failed to update exam.' });
  }
};

const deleteExam = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM exams WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'Exam not found or you do not have permission to delete it.' });
    }

    res.json({ message: 'Exam deleted successfully.' });
  } catch (err) {
    console.error('Delete exam error:', err);
    res.status(500).json({ error: 'Failed to delete exam.' });
  }
};

module.exports = { getExams, createExam, updateExam, deleteExam };
