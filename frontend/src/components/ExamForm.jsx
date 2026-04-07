import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EMPTY = { course: '', course_id: '', day: '', time: '', room: '', date: '' };

function getDayFromDate(dateStr) {
  if (!dateStr) return '';
  // Append T00:00:00 so it's parsed as local time, not UTC midnight
  const d = new Date(dateStr + 'T00:00:00');
  return DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]; // map Sun=0 → index 6
}

/**
 * Reusable Add / Edit exam form.
 * @param {object|null} exam     - Existing exam when editing, null when adding
 * @param {function}    onSubmit - Called with form data object
 * @param {function}    onCancel
 * @param {boolean}     loading  - Disables submit while saving
 */
export default function ExamForm({ exam, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (exam) {
      setForm({
        course:    exam.course,
        course_id: exam.course_id,
        day:       exam.day,
        time:      exam.time,
        room:      exam.room,
        // Postgres returns full ISO timestamp; slice to YYYY-MM-DD for the input
        date:      exam.date ? String(exam.date).slice(0, 10) : '',
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [exam]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    // Auto-fill Day when Date changes
    if (name === 'date') {
      updated.day = getDayFromDate(value);
    }
    setForm(updated);
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.course.trim())    errs.course    = 'Course name is required';
    if (!form.course_id.trim()) errs.course_id = 'Course ID is required';
    if (!form.day.trim())       errs.day       = 'Day is required';
    if (!form.time.trim())      errs.time      = 'Time is required';
    if (!form.room.trim())      errs.room      = 'Room is required';
    if (!form.date)             errs.date      = 'Date is required';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit(form);
  };

  const field = (label, name, props = {}) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        name={name}
        value={form[name]}
        onChange={handleChange}
        className={`w-full px-3 py-2 rounded-lg border text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-300'
        }`}
        {...props}
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {field('Course Name', 'course', { placeholder: 'e.g. Calculus II' })}

      <div className="grid grid-cols-2 gap-4">
        {field('Course ID', 'course_id', { placeholder: 'e.g. MATH201' })}
        {field('Room', 'room', { placeholder: 'e.g. Hall A - 201' })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Date — auto-fills Day */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-lg border text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.date ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
        </div>

        {/* Day — editable, auto-populated from Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
          <select
            name="day"
            value={form.day}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-lg border text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
              errors.day ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select day</option>
            {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {errors.day && <p className="text-red-500 text-xs mt-1">{errors.day}</p>}
        </div>
      </div>

      {field('Time', 'time', { type: 'time', placeholder: '09:00' })}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#1e3a5f] hover:bg-[#162d4a] disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              Saving…
            </>
          ) : exam ? 'Save Changes' : 'Add Exam'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-60 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
