import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { useAuth } from '../../context/AuthContext';
import {
  DocumentCategory,
  ExamType,
  NoteUnit,
} from '../../types';
import { Button } from './Button';

const NOTE_UNITS: NoteUnit[] = [
  'Module 1',
  'Module 1 - Part 1',
  'Module 1 - Part 2',
  'Module 2',
  'Module 2 - Part 1',
  'Module 2 - Part 2',
  'Module 3',
  'Module 3 - Part 1',
  'Module 3 - Part 2',
  'Module 4',
  'Module 4 - Part 1',
  'Module 4 - Part 2',
  'Module 5',
  'Module 5 - Part 1',
  'Module 5 - Part 2',
  'IS Standard Code',
  'Reference Manual',
  'Formula Sheets',
  'Revision Notes',
];

const EXAM_TYPES: ExamType[] = [
  'End-Semester Examination',
  'Mid-Semester Test',
  'Previous Year Examination',
  'Semester Examination',
  'Internal Examination',
  'Model Examination',
  'Supplementary Examination',
];

export const UploadModal: React.FC = () => {
  const { isUploadModalOpen, closeUploadModal, uploadCategory, uploadSubjectId, subjects, addDocument } = usePortal();
  const { user, role } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<DocumentCategory>(uploadCategory || 'notes');
  const [title, setTitle] = useState('');
  const [semester, setSemester] = useState(5);
  const [subjectId, setSubjectId] = useState(uploadSubjectId || subjects[0]?.id || '');
  const [unit, setUnit] = useState<NoteUnit>('Module 1');
  const [topic, setTopic] = useState('');
  const [author, setAuthor] = useState('');
  const [edition, setEdition] = useState('');
  const [examType, setExamType] = useState<ExamType>('End-Semester Examination');
  const [examYear, setExamYear] = useState(2024);
  const [description, setDescription] = useState('');

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync category & subjectId when modal opens
  React.useEffect(() => {
    if (uploadCategory) {
      setCategory(uploadCategory);
    }
    if (uploadSubjectId) {
      setSubjectId(uploadSubjectId);
      const sub = subjects.find((s) => s.id === uploadSubjectId);
      if (sub) {
        setSemester(sub.semester);
      }
    }
  }, [uploadCategory, uploadSubjectId, subjects]);

  const availableSubjects = React.useMemo(() => {
    const list = subjects.filter((s) => s.semester === semester);
    return list.length > 0 ? list : subjects;
  }, [subjects, semester]);

  const handleSemesterChange = (newSem: number) => {
    setSemester(newSem);
    const firstSubInSem = subjects.find((s) => s.semester === newSem);
    if (firstSubInSem) {
      setSubjectId(firstSubInSem.id);
    }
  };

  if (!isUploadModalOpen) return null;

  const handleFileSelect = (file: File) => {
    setErrorMsg('');
    const validExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!validExtensions.includes(ext)) {
      setErrorMsg(`Invalid file type (.${ext}). Supported: PDF, DOC, DOCX, PPT, PPTX, JPG, PNG`);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 25 MB limit.');
      return;
    }

    setSelectedFile(file);
    if (!title) {
      const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setTitle(cleanName.replace(/_/g, ' '));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFileDataUrl((e.target?.result as string) || '');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a document title.');
      return;
    }
    if (!selectedFile && !fileDataUrl) {
      setErrorMsg('Please select or drop a file to upload.');
      return;
    }

    const targetSubject = subjects.find((s) => s.id === subjectId) || availableSubjects[0];
    if (!targetSubject) {
      setErrorMsg('No subject available for Semester ' + semester + '. Please add a subject first.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 25;
      });
    }, 120);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);

      const ext = selectedFile?.name.split('.').pop()?.toLowerCase() || 'pdf';
      const fileType = ['jpg', 'jpeg', 'png'].includes(ext)
        ? 'image'
        : ext === 'docx' || ext === 'doc'
        ? 'docx'
        : ext === 'pptx' || ext === 'ppt'
        ? 'pptx'
        : 'pdf';

      const fileSizeMb = selectedFile
        ? selectedFile.size > 1024 * 1024
          ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(selectedFile.size / 1024)} KB`
        : '2.1 MB';

      addDocument({
        title: title.trim(),
        fileName: selectedFile?.name || `${title.replace(/\s+/g, '_')}.${ext}`,
        fileUrl: fileDataUrl || `https://example.com/docs/${title.replace(/\s+/g, '_')}.${ext}`,
        fileType,
        fileSize: fileSizeMb,
        category,
        subjectId: targetSubject.id,
        subjectCode: targetSubject.code,
        subjectName: targetSubject.name,
        semester,
        unit: category === 'notes' || category === 'textbook' ? unit : undefined,
        topic: topic ? topic.trim() : undefined,
        author: author ? author.trim() : undefined,
        edition: edition ? edition.trim() : undefined,
        examType: category === 'question_paper' ? examType : undefined,
        examYear: category === 'question_paper' ? examYear : undefined,
        description: description.trim(),
        uploadedBy: user.name,
        uploaderRole: role,
        isBookmarked: false,
      }).catch((err) => {
        setErrorMsg(err.message || 'Upload failed');
      });

      setIsUploading(false);
      closeUploadModal();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-concrete-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-2xl bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-700 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-blueprint-900 text-white border-b border-blueprint-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blueprint-700 text-safety border border-blueprint-500/50">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-base sm:text-lg text-white">
                Upload Civil Engineering Resource
              </h2>
              <p className="text-xs text-blueprint-300 font-sans">
                Post lecture notes, standard textbooks, IS codes, or PYQ papers to Elcivilo
              </p>
            </div>
          </div>
          <button
            onClick={closeUploadModal}
            className="p-1.5 text-blueprint-300 hover:text-white hover:bg-blueprint-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-300 font-mono">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Category Selector Tabs */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-concrete-600 dark:text-concrete-400 mb-2">
              Resource Classification:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              {[
                { id: 'notes', label: 'Lecture Notes' },
                { id: 'textbook', label: 'Textbook / Code' },
                { id: 'pyq', label: 'PYQ Exam Paper' },
                { id: 'assignment', label: 'Assignment Brief' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as DocumentCategory)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-semibold ${
                    category === cat.id
                      ? 'bg-blueprint-700 border-blueprint-800 text-white shadow-xs'
                      : 'bg-concrete-50 dark:bg-concrete-800 border-concrete-200 dark:border-concrete-700 text-concrete-700 dark:text-concrete-300 hover:border-blueprint-400'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Semester & Subject Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-concrete-700 dark:text-concrete-300 mb-1">
                Academic Semester *
              </label>
              <select
                value={semester}
                onChange={(e) => handleSemesterChange(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono focus:outline-none focus:border-blueprint-600"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-concrete-700 dark:text-concrete-300 mb-1">
                Target Subject *
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                disabled={availableSubjects.length === 0}
                className="w-full px-3 py-2 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono focus:outline-none focus:border-blueprint-600 disabled:opacity-50"
              >
                {availableSubjects.length === 0 ? (
                  <option value="">No subjects created yet for Semester {semester}</option>
                ) : (
                  availableSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code}: {sub.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Document Title */}
          <div>
            <label className="block text-xs font-mono font-bold text-concrete-700 dark:text-concrete-300 mb-1">
              Document Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Module 2: Limit State Design of Rectangular Beams"
              className="w-full px-3 py-2 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white placeholder:text-concrete-400 focus:outline-none focus:border-blueprint-600 font-sans"
            />
          </div>

          {/* Contextual fields: Unit / Author / Exam Year */}
          {(category === 'notes' || category === 'textbook') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-concrete-700 dark:text-concrete-300 mb-1">
                  Module / Unit Classification
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as NoteUnit)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono focus:outline-none"
                >
                  {NOTE_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              {category === 'textbook' ? (
                <div>
                  <label className="block text-xs font-mono font-bold text-concrete-700 dark:text-concrete-300 mb-1">
                    Author / Publishing Standard
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g., Dr. B.C. Punmia or Bureau of Indian Standards"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-sans focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-mono font-bold text-concrete-700 dark:text-concrete-300 mb-1">
                    Specific Topic / Derivation
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Flexural Analysis of Beams"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-sans focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {category === 'question_paper' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-concrete-700 dark:text-concrete-300 mb-1">
                  Examination Session Type
                </label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value as ExamType)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono focus:outline-none"
                >
                  {EXAM_TYPES.map((et) => (
                    <option key={et} value={et}>
                      {et}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-concrete-700 dark:text-concrete-300 mb-1">
                  Academic Year (2020–2026)
                </label>
                <input
                  type="number"
                  min="2018"
                  max="2027"
                  value={examYear}
                  onChange={(e) => setExamYear(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-mono font-bold text-concrete-700 dark:text-concrete-300 mb-1">
              Description & Specifications
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline learning outcomes, derivations included, and IS standard compliance..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-sans focus:outline-none"
            />
          </div>

          {/* Drag & Drop File Zone */}
          <div>
            <label className="block text-xs font-mono font-bold text-concrete-700 dark:text-concrete-300 mb-1">
              Select or Drop File (.pdf, .docx, .pptx) *
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-blueprint-600 bg-blueprint-50/70 dark:bg-blueprint-950/40'
                  : selectedFile
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-concrete-300 dark:border-concrete-700 hover:border-blueprint-400 bg-concrete-50 dark:bg-concrete-950'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                onChange={(e) => e.target.files && e.target.files[0] && handleFileSelect(e.target.files[0])}
              />

              {selectedFile ? (
                <div className="flex items-center justify-center gap-3 text-emerald-700 dark:text-emerald-400">
                  <FileCheck className="w-6 h-6" />
                  <div className="text-left font-mono text-xs">
                    <p className="font-bold truncate max-w-xs">{selectedFile.name}</p>
                    <p className="text-[10px] text-concrete-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to commit
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <UploadCloud className="w-8 h-8 mx-auto text-blueprint-600 dark:text-blueprint-400" />
                  <p className="text-xs font-semibold text-concrete-800 dark:text-concrete-200">
                    Click to browse or drag & drop syllabus / notes file
                  </p>
                  <p className="text-[10px] font-mono text-concrete-500">
                    PDF, Word, or Presentation up to 25 MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1 pt-2 font-mono text-xs">
              <div className="flex justify-between text-concrete-600 dark:text-concrete-400">
                <span>Committing to repository...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-concrete-200 dark:bg-concrete-800 overflow-hidden">
                <div
                  className="h-full bg-blueprint-600 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-concrete-200 dark:border-concrete-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeUploadModal}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl border border-concrete-300 dark:border-concrete-700 text-concrete-700 dark:text-concrete-300 text-xs font-mono font-semibold hover:bg-concrete-100 cursor-pointer"
            >
              Cancel
            </button>
            <Button
              type="submit"
              variant="blueprint"
              disabled={isUploading}
              icon={<UploadCloud className="w-4 h-4" />}
            >
              {isUploading ? 'Uploading...' : 'Publish to Elcivilo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
