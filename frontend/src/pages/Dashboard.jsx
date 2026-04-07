import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import ExamTable from '../components/ExamTable';
import ExamForm from '../components/ExamForm';
import Modal from '../components/Modal';
import ToastContainer from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import api, { getErrorMessage } from '../utils/api';
import { exportExamsToPDF } from '../utils/pdfExport';

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();

  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null); // null = add mode
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  // ── Fetch exams ──────────────────────────────────────────────────────────────
  const fetchExams = useCallback(async () => {
    setLoadingExams(true);
    try {
      const res = await api.get('/api/exams');
      setExams(res.data.exams);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingExams(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchExams(); }, [fetchExams]);

  // ── Stats helpers ────────────────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = exams.filter((e) => new Date(e.date) >= today);
  const nextExam = upcoming[0];

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingExam(null);
    setModalOpen(true);
  };

  const openEdit = (exam) => {
    setEditingExam(exam);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return; // prevent closing mid-save
    setModalOpen(false);
    setEditingExam(null);
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editingExam) {
        const res = await api.put(`/api/exams/${editingExam.id}`, formData);
        setExams((prev) =>
          prev
            .map((e) => (e.id === editingExam.id ? res.data.exam : e))
            .sort(sortByDate)
        );
        toast.success('Exam updated successfully.');
      } else {
        const res = await api.post('/api/exams', formData);
        setExams((prev) => [...prev, res.data.exam].sort(sortByDate));
        toast.success('Exam added successfully.');
      }
      closeModal();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/exams/${id}`);
      setExams((prev) => prev.filter((e) => e.id !== id));
      toast.success('Exam deleted.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = () => {
    if (exams.length === 0) {
      toast.info('No exams to export yet.');
      return;
    }
    setExportLoading(true);
    try {
      exportExamsToPDF(exams, user.name);
      toast.success('PDF downloaded.');
    } catch {
      toast.error('Failed to generate PDF.');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Page title + actions ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Exam Schedule</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              {loadingExams
                ? 'Loading…'
                : exams.length === 0
                ? 'No exams added yet'
                : `${exams.length} exam${exams.length !== 1 ? 's' : ''} total · ${upcoming.length} upcoming`}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExport}
              disabled={exportLoading || loadingExams}
              className="flex items-center gap-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              {exportLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              Export PDF
            </button>

            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Exam
            </button>
          </div>
        </div>

        {/* ── Stats cards ──────────────────────────────────────────────────── */}
        {!loadingExams && exams.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <StatCard label="Total Exams" value={exams.length} color="blue" />
            <StatCard label="Upcoming" value={upcoming.length} color="green" />
            <StatCard
              label="Next Exam"
              value={
                nextExam
                  ? new Date(nextExam.date).toLocaleDateString('en-US', {
                      timeZone: 'UTC', month: 'short', day: 'numeric',
                    })
                  : '—'
              }
              color="purple"
              className="col-span-2 sm:col-span-1"
            />
          </div>
        )}

        {/* ── Table / loading ───────────────────────────────────────────────── */}
        {loadingExams ? (
          <div className="flex items-center justify-center py-32">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <ExamTable
            exams={exams}
            onEdit={openEdit}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        )}
      </main>

      {/* ── Add / Edit modal ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingExam ? 'Edit Exam' : 'Add New Exam'}
      >
        <ExamForm
          exam={editingExam}
          onSubmit={handleSave}
          onCancel={closeModal}
          loading={saving}
        />
      </Modal>

      {/* ── Toast notifications ──────────────────────────────────────────────── */}
      <ToastContainer toasts={toast.toasts} dismiss={toast.dismiss} />
    </div>
  );
}

function StatCard({ label, value, color, className = '' }) {
  const colorMap = {
    blue:   'bg-blue-50   text-blue-700   border-blue-200',
    green:  'bg-green-50  text-green-700  border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return (
    <div className={`rounded-xl border px-4 py-4 ${colorMap[color]} ${className}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function sortByDate(a, b) {
  if (a.date === b.date) return a.time.localeCompare(b.time);
  return new Date(a.date) - new Date(b.date);
}
