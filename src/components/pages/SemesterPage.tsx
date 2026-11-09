import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  X,
  Sparkles,
  Layers,
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Subject } from '../../types';

export const SemesterPage: React.FC = () => {
  const { semId } = useParams<{ semId: string }>();
  const navigate = useNavigate();
  const { getSubjectsBySemester, addSubject, updateSubject, deleteSubject, showToast } = usePortal();
  const { isAdmin } = useAuth();

  const semesterNum = Number(semId) || 1;
  const subjects = getSubjectsBySemester(semesterNum);

  // Add Subject Modal State (for Admin)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState<number>(4);
  const [facultyName, setFacultyName] = useState('');
  const [description, setDescription] = useState('');

  // Edit Subject Modal State (for Admin)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');
  const [editCredits, setEditCredits] = useState<number>(4);
  const [editFacultyName, setEditFacultyName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSemester, setEditSemester] = useState<number>(semesterNum);

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      showToast('Please enter both subject code and subject name.', 'error');
      return;
    }

    addSubject({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      semester: semesterNum,
      credits: Number(credits) || 3,
      facultyName: facultyName.trim() || undefined,
      description: description.trim() || undefined,
    });

    // Reset form
    setCode('');
    setName('');
    setCredits(4);
    setFacultyName('');
    setDescription('');
    setIsAddModalOpen(false);
  };

  const handleDeleteSubject = (e: React.MouseEvent, id: string, subjectCode: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove subject ${subjectCode}?`)) {
      deleteSubject(id);
    }
  };

  const handleOpenEdit = (e: React.MouseEvent, sub: Subject) => {
    e.stopPropagation();
    setEditingSubject(sub);
    setEditCode(sub.code);
    setEditName(sub.name);
    setEditCredits(sub.credits);
    setEditFacultyName(sub.facultyName || '');
    setEditDescription(sub.description || '');
    setEditSemester(sub.semester);
  };

  const handleUpdateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    if (!editCode.trim() || !editName.trim()) {
      showToast('Please enter both subject code and subject name.', 'error');
      return;
    }

    updateSubject({
      id: editingSubject.id,
      code: editCode.trim().toUpperCase(),
      name: editName.trim(),
      semester: editSemester,
      credits: Number(editCredits) || 3,
      facultyName: editFacultyName.trim() || undefined,
      description: editDescription.trim() || undefined,
    });

    setEditingSubject(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-concrete-300 dark:border-concrete-800 pb-5">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-concrete-500 hover:text-blueprint-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Semesters</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-concrete-900 dark:text-white">
              Semester {semesterNum} Subjects
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-concrete-200 dark:bg-concrete-800 text-concrete-700 dark:text-concrete-300 border border-concrete-300 dark:border-concrete-700">
              {subjects.length} {subjects.length === 1 ? 'Course' : 'Courses'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-concrete-500 font-sans mt-0.5">
            Select a subject to access its class notes, textbooks, assignments, and previous year questions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Quick Semester Switcher */}
          <div className="flex items-center gap-1 font-mono text-xs">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <button
                key={s}
                onClick={() => navigate(`/semester/${s}`)}
                className={`w-7 h-7 rounded-lg font-bold transition-all ${s === semesterNum
                  ? 'bg-blueprint-700 text-white shadow-xs'
                  : 'bg-concrete-200 dark:bg-concrete-800 text-concrete-700 dark:text-concrete-300 hover:bg-concrete-300 dark:hover:bg-concrete-700'
                  }`}
                title={`Semester ${s}`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Admin Add Subject Button */}
          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAddModalOpen(true)}
              className="ml-2"
            >
              Add Subject
            </Button>
          )}
        </div>
      </div>

      {/* Subject Cards List */}
      <div className="space-y-3.5">
        {subjects.map((sub) => (
          <div
            key={sub.id}
            onClick={() => navigate(`/semester/${semesterNum}/subject/${sub.id}`)}
            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-concrete-900 border-2 border-concrete-300 dark:border-concrete-800 hover:border-blueprint-600 dark:hover:border-blueprint-400 hover:shadow-blueprint transition-all cursor-pointer relative"
          >
            <div className="space-y-1.5 min-w-0 pr-8 sm:pr-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-blueprint-100 text-blueprint-800 dark:bg-blueprint-950 dark:text-blueprint-300 border border-blueprint-300 dark:border-blueprint-800">
                  {sub.code}
                </span>
                <span className="font-mono text-xs text-concrete-500 font-semibold">
                  {sub.credits} Credits
                </span>
                {sub.facultyName && (
                  <span className="font-mono text-xs text-concrete-400 hidden md:inline">
                    • Instructor: {sub.facultyName}
                  </span>
                )}
              </div>

              <h2 className="font-heading font-bold text-lg sm:text-xl text-concrete-900 dark:text-white group-hover:text-blueprint-600 dark:group-hover:text-blueprint-400 transition-colors">
                {sub.name}
              </h2>

              {sub.description && (
                <p className="text-xs sm:text-sm text-concrete-600 dark:text-concrete-400 font-sans line-clamp-2">
                  {sub.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-concrete-100 dark:border-concrete-800">
              {isAdmin && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title={`Edit ${sub.code}`}
                    onClick={(e) => handleOpenEdit(e, sub)}
                    className="p-1.5 text-concrete-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title={`Delete ${sub.code}`}
                    onClick={(e) => handleDeleteSubject(e, sub.id, sub.code)}
                    className="p-1.5 text-concrete-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <span className="text-xs font-mono font-semibold text-blueprint-700 dark:text-blueprint-300 group-hover:translate-x-0.5 transition-transform">
                Open Resource Hub →
              </span>
            </div>
          </div>
        ))}

        {/* Clean, Modern Empty State */}
        {subjects.length === 0 && (
          <div className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-concrete-900 border-2 border-dashed border-concrete-300 dark:border-concrete-800 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-concrete-100 dark:bg-concrete-800 flex items-center justify-center text-concrete-400 dark:text-concrete-500">
              <BookOpen className="w-6 h-6" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="font-heading font-bold text-base sm:text-lg text-concrete-900 dark:text-white">
                No Subjects Configured for Semester {semesterNum}
              </h3>
              <p className="text-xs sm:text-sm text-concrete-500 font-sans leading-relaxed">
                {isAdmin
                  ? 'There are currently no courses published for this semester. Click below to add the official syllabus and curriculum subjects.'
                  : 'Curriculum courses for this semester have not been published yet. Please check back soon or browse another semester.'}
              </p>
            </div>

            {isAdmin ? (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Add Subject for Semester {semesterNum}
              </Button>
            ) : (
              <div className="pt-2">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-blueprint-600 dark:text-blueprint-400 hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Explore Other Semesters</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Admin Modal: Add New Subject */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-concrete-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-concrete-200 dark:border-concrete-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blueprint-100 dark:bg-blueprint-900 flex items-center justify-center text-blueprint-700 dark:text-blueprint-300">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-concrete-900 dark:text-white">
                    Add Subject
                  </h3>
                  <p className="text-xs font-mono text-concrete-500">Semester {semesterNum}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-concrete-400 hover:text-concrete-700 dark:hover:text-concrete-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-mono uppercase text-concrete-500 font-semibold mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CE-301"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono focus:outline-none focus:border-blueprint-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-concrete-500 font-semibold mb-1">
                    Credits *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    required
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono focus:outline-none focus:border-blueprint-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-concrete-500 font-semibold mb-1">
                  Subject Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Structural Analysis & Design"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-sans focus:outline-none focus:border-blueprint-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-concrete-500 font-semibold mb-1">
                  Faculty / Instructor Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Doom"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-sans focus:outline-none focus:border-blueprint-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-concrete-500 font-semibold mb-1">
                  Description / Syllabus Outline (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief course objectives and topics covered..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-sans focus:outline-none focus:border-blueprint-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-concrete-200 dark:border-concrete-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Save Subject
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Modal: Edit Subject */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-concrete-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-concrete-200 dark:border-concrete-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-700 dark:text-amber-400">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-concrete-900 dark:text-white">
                    Edit Subject
                  </h3>
                  <p className="text-xs font-mono text-concrete-500">Modifying {editingSubject.code}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingSubject(null)}
                className="p-1.5 text-concrete-400 hover:text-concrete-700 dark:hover:text-concrete-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-mono uppercase text-concrete-500 font-semibold mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CE-301"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono focus:outline-none focus:border-blueprint-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-concrete-500 font-semibold mb-1">
                    Credits *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    required
                    value={editCredits}
                    onChange={(e) => setEditCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono focus:outline-none focus:border-blueprint-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-concrete-500 font-semibold mb-1">
                  Subject Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Structural Analysis & Design"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-sans focus:outline-none focus:border-blueprint-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-concrete-500 font-semibold mb-1">
                  Faculty / Instructor Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Doom"
                  value={editFacultyName}
                  onChange={(e) => setEditFacultyName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-sans focus:outline-none focus:border-blueprint-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-concrete-500 font-semibold mb-1">
                  Description / Syllabus Outline (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief course objectives and topics covered..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-sans focus:outline-none focus:border-blueprint-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-concrete-200 dark:border-concrete-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingSubject(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={<Edit3 className="w-4 h-4" />}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
