import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export the student's exam list as a styled PDF.
 * @param {Array}  exams    - Array of exam objects from the API
 * @param {string} userName - Name of the logged-in student
 */
export function exportExamsToPDF(exams, userName) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  // ── Navy header bar ─────────────────────────────────────────────────────────
  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, pageW, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ExamTracker — Exam Schedule', pageW / 2, 14, { align: 'center' });

  // ── Sub-header info ──────────────────────────────────────────────────────────
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Student: ${userName}`, 14, 31);
  doc.text(`Generated: ${today}`, 14, 37);
  doc.text(`Total exams: ${exams.length}`, 14, 43);

  // ── Table ────────────────────────────────────────────────────────────────────
  autoTable(doc, {
    startY: 50,
    head: [['Course', 'Course ID', 'Day', 'Date', 'Time', 'Room']],
    body: exams.map((e) => [
      e.course,
      e.course_id,
      e.day,
      formatDateDisplay(e.date),
      e.time,
      e.room,
    ]),
    headStyles: {
      fillColor: [30, 58, 95],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [240, 245, 255] },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 30 },
      2: { cellWidth: 28 },
      3: { cellWidth: 38 },
      4: { cellWidth: 28 },
      5: { cellWidth: 40 },
    },
    margin: { left: 14, right: 14 },
  });

  // ── Page numbers ─────────────────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  const filename = `exam-schedule-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/** Format an ISO date string (or Date) for display in the PDF table. */
function formatDateDisplay(dateVal) {
  const d = new Date(dateVal);
  return d.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
