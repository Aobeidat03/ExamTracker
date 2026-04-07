import React from 'react';

function formatDate(dateVal) {
  return new Date(dateVal).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function isPast(dateVal) {
  const exam = new Date(dateVal);
  exam.setUTCHours(23, 59, 59);
  return exam < new Date();
}

/**
 * Responsive exam table.
 * @param {Array}    exams       - Sorted list of exam objects
 * @param {Function} onEdit      - Called with exam object
 * @param {Function} onDelete    - Called with exam id
 * @param {boolean}  deletingId  - Id of exam currently being deleted (shows spinner)
 */
export default function ExamTable({ exams, onEdit, onDelete, deletingId }) {
  if (exams.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-lg font-medium text-gray-500">No exams yet</p>
        <p className="text-sm mt-1">Click <strong>Add Exam</strong> to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-thin rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full text-sm text-left min-w-[640px]">
        <thead>
          <tr className="bg-[#1e3a5f] text-white">
            {['Course', 'Course ID', 'Day', 'Date', 'Time', 'Room', 'Actions'].map((h) => (
              <th key={h} className="px-4 py-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {exams.map((exam, i) => {
            const past = isPast(exam.date);
            return (
              <tr
                key={exam.id}
                className={`transition ${past ? 'bg-gray-50 text-gray-400' : i % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'} hover:bg-blue-50`}
              >
                <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                  {exam.course}
                  {past && (
                    <span className="ml-2 text-[10px] font-semibold bg-gray-200 text-gray-500 rounded px-1.5 py-0.5 uppercase tracking-wide">
                      Past
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-gray-600">{exam.course_id}</td>
                <td className="px-4 py-3 whitespace-nowrap">{exam.day}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(exam.date)}</td>
                <td className="px-4 py-3 whitespace-nowrap">{exam.time}</td>
                <td className="px-4 py-3 whitespace-nowrap">{exam.room}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(exam)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition border border-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(exam.id)}
                      disabled={deletingId === exam.id}
                      className="text-red-600 hover:text-red-800 font-medium text-xs px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition border border-red-200 disabled:opacity-50"
                    >
                      {deletingId === exam.id ? '…' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
