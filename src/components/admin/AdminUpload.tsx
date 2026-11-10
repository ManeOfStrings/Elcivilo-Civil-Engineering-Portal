import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UploadCloud,
  CheckCircle2,
  Database,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { useAuth } from '../../context/AuthContext';
import { uploadAcademicFile, deleteAcademicFile, isSupabaseConfigured } from '../../lib/supabase';
import { DocumentCategory, NoteUnit, ExamType, SupplyCategory } from '../../types';
import { Button } from '../common/Button';

export const AdminUpload: React.FC = () => {
  const { subjects, addDocument, showToast } = usePortal();
  const { hasSupabaseAuth } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState<DocumentCategory>('notes');
  const [semester, setSemester] = useState<number>(5);
  const [subjectId, setSubjectId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('Module 1');
  const [selectedPart, setSelectedPart] = useState<string>('');
  const [customUnit, setCustomUnit] = useState<string>('');
  const [examType, setExamType] = useState<ExamType>('End-Semester');
  const [examYear, setExamYear] = useState<number>(2026);
  const [supplyCategory, setSupplyCategory] = useState<SupplyCategory>('important_questions');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState('');
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [uploadSpeed, setUploadSpeed] = useState<string>('');
  const [bytesProgress, setBytesProgress] = useState<string>('');

  const currentUnitTag =
    selectedModule === 'custom'
      ? customUnit.trim() || 'Custom Unit'
      : selectedPart === 'custom'
        ? `${selectedModule} - ${customUnit.trim() || 'Custom Part'}`
        : selectedPart
          ? `${selectedModule} - ${selectedPart}`
          : selectedModule;

  // Filter subjects by chosen semester
  const semesterSubjects = subjects.filter((s) => s.semester === semester);
  const activeSubjectId = subjectId || (semesterSubjects[0]?.id ?? '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        // Auto populate title from file name without extension
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName);
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('Please select a PDF document file to upload.', 'error');
      return;
    }

    const isSyllabus = category === 'syllabus';
    const currentSubject = isSyllabus
      ? null
      : semesterSubjects.find((s) => s.id === activeSubjectId) || semesterSubjects[0];

    if (!isSyllabus && !currentSubject) {
      showToast('Please select a valid subject for this semester.', 'error');
      return;
    }

    setIsUploading(true);
    setUploadPercent(0);
    setUploadSpeed('');
    setBytesProgress('');
    setUploadProgressMsg('Initializing streaming upload to Supabase...');

    let uploadedStoragePath: string | undefined;

    try {
      // 1. Upload to Supabase Storage bucket with real-time streaming progress
      const { publicUrl, storagePath } = await uploadAcademicFile(selectedFile, category, (progress) => {
        setUploadPercent(progress.percent);
        setUploadSpeed(progress.speedText);
        const loadedMb = (progress.loadedBytes / (1024 * 1024)).toFixed(1);
        const totalMb = (progress.totalBytes / (1024 * 1024)).toFixed(1);
        setBytesProgress(`${loadedMb} MB / ${totalMb} MB`);
        if (progress.percent < 100) {
          setUploadProgressMsg(`Streaming to cloud vault (${progress.percent}%)...`);
        } else {
          setUploadProgressMsg('Upload complete! Finalizing document catalog...');
        }
      });

      uploadedStoragePath = storagePath;
      setUploadProgressMsg('Writing document record to Supabase database...');

      const computedUnit =
        selectedModule === 'custom'
          ? customUnit.trim() || 'General Notes'
          : selectedPart === 'custom'
            ? `${selectedModule} - ${customUnit.trim() || 'Part'}`
            : selectedPart
              ? `${selectedModule} - ${selectedPart}`
              : selectedModule;

      // 2. Add document record to Supabase database (and state)
      await addDocument({
        title: title.trim(),
        fileName: selectedFile.name,
        fileUrl: publicUrl,
        fileType: 'pdf',
        fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
        category,
        subjectId: currentSubject ? currentSubject.id : `sem_${semester}_syllabus`,
        subjectCode: currentSubject ? currentSubject.code : `SEM ${semester}`,
        subjectName: currentSubject ? currentSubject.name : `Semester ${semester} General Curriculum Syllabus`,
        semester,
        description: description.trim(),
        unit: category === 'notes' ? computedUnit : undefined,
        examType: category === 'question_paper' ? examType : undefined,
        examYear: category === 'question_paper' ? examYear : undefined,
        supplyCategory: category === 'supply' ? supplyCategory : undefined,
        storagePath,
        uploadedBy: 'Dr. Doom (HOD)',
        isBookmarked: false,
      });

      showToast(`Successfully uploaded "${title}" to Supabase Academic Vault!`, 'success');
      navigate('/admin/manage');
    } catch (err: any) {
      console.error('Upload failure:', err);
      // Clean up orphaned storage file if database record failed
      if (uploadedStoragePath) {
        deleteAcademicFile(uploadedStoragePath).catch(() => {});
      }
      showToast(err.message || 'File upload failed. Please try again.', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgressMsg('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blueprint-100 dark:bg-blueprint-950 text-blueprint-800 dark:text-blueprint-300 font-mono text-xs font-bold border border-blueprint-300 dark:border-blueprint-800">
            <UploadCloud className="h-4 w-4" />
            <span>SUPABASE STORAGE & REPOSITORY INGESTION</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-concrete-900 dark:text-white tracking-tight">
            Upload Academic Material
          </h1>
          <p className="text-sm sm:text-base text-concrete-600 dark:text-concrete-400 leading-relaxed font-sans">
            Store course syllabi, lecture notes, past exam question papers, or supply formula sheets into the public storage bucket with complete metadata.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-concrete-100 dark:bg-concrete-800 font-mono text-xs text-concrete-600 dark:text-concrete-300 border border-concrete-200 dark:border-concrete-700 shrink-0">
          <Database className="h-4 w-4 text-safety" />
          <span>Target Bucket: <strong>academic-vault</strong></span>
        </div>
      </div>

      {/* Upload Form Card */}
      <div className="bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-800 rounded-3xl p-7 sm:p-10 shadow-sm">
        {isSupabaseConfigured && !hasSupabaseAuth && (
          <div className="mb-6 p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-safety shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  Supabase Authentication Required
                </h3>
                <p className="text-xs text-concrete-600 dark:text-concrete-400 font-sans">
                  You are currently in Demo Mode. Supabase Row Level Security (RLS) requires an authenticated administrator session to persist uploads to the cloud database and vault.
                </p>
              </div>
            </div>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-concrete-900 text-white dark:bg-concrete-100 dark:text-concrete-900 text-xs font-mono font-bold hover:bg-blueprint-600 dark:hover:bg-blueprint-400 transition-colors shrink-0"
            >
              Sign into Supabase →
            </Link>
          </div>
        )}

        <form onSubmit={handleUploadSubmit} className="space-y-6">
          {/* Top Row: Category & Semester */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-concrete-600 dark:text-concrete-300">
                1. Resource Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full p-3 rounded-2xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-sans text-sm focus:ring-2 focus:ring-blueprint-500 shadow-sm"
              >
                <option value="syllabus">Curriculum Course Syllabus</option>
                <option value="notes">Class Notes & Lecture Modules</option>
                <option value="question_paper">Previous Year Question Paper (PYQ)</option>
                <option value="supply">Supply Special Notes & Formulas</option>
              </select>
            </div>

            {/* Semester Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-concrete-600 dark:text-concrete-300">
                2. Academic Semester *
              </label>
              <select
                value={semester}
                onChange={(e) => {
                  const sem = Number(e.target.value);
                  setSemester(sem);
                  const firstSub = subjects.find((s) => s.semester === sem);
                  setSubjectId(firstSub ? firstSub.id : '');
                }}
                className="w-full p-3 rounded-2xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-sans text-sm focus:ring-2 focus:ring-blueprint-500 shadow-sm"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s} (Civil Engineering)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject Dropdown (hidden when uploading general Curriculum Course Syllabus) */}
          {category !== 'syllabus' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-concrete-600 dark:text-concrete-300">
                  3. Course Subject (Filtered for Sem {semester}) *
                </label>
                {semesterSubjects.length === 0 && (
                  <button
                    type="button"
                    onClick={() => navigate('/admin/manage')}
                    className="text-xs font-mono text-blueprint-600 dark:text-blueprint-400 hover:underline"
                  >
                    + Create Subject First
                  </button>
                )}
              </div>

              {semesterSubjects.length === 0 ? (
                <div className="p-4 rounded-2xl border-2 border-dashed border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-500 text-xs font-mono">
                  No subjects configured for Semester {semester}. Please go to{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/admin/manage')}
                    className="text-blueprint-600 dark:text-blueprint-400 underline font-semibold"
                  >
                    Admin Manage
                  </button>{' '}
                  to create subjects first.
                </div>
              ) : (
                <select
                  value={activeSubjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-sans text-sm focus:ring-2 focus:ring-blueprint-500 shadow-sm"
                >
                  {semesterSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code} - {sub.name} ({sub.credits} Credits • {sub.facultyName})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Conditional Metadata */}
          {category === 'notes' && (
            <div className="p-5 rounded-2xl bg-concrete-50 dark:bg-concrete-800/50 border border-concrete-200 dark:border-concrete-700/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-concrete-600 dark:text-concrete-300 block">
                    Course Module / Unit Allocation
                  </label>
                  <p className="text-[11px] font-sans text-concrete-500">
                    Assign a module number and an optional sub-part (e.g. Part 1, Part 2).
                  </p>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-blueprint-100 text-blueprint-800 dark:bg-blueprint-950 dark:text-blueprint-300 border border-blueprint-300 dark:border-blueprint-800 shrink-0">
                  Tag: <strong className="font-bold">{currentUnitTag}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-mono font-semibold text-concrete-500 mb-1 block">
                    1. Primary Module / Unit
                  </label>
                  <select
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white text-xs font-mono"
                  >
                    <option value="Module 1">Module 1 (Unit 1)</option>
                    <option value="Module 2">Module 2 (Unit 2)</option>
                    <option value="Module 3">Module 3 (Unit 3)</option>
                    <option value="Module 4">Module 4 (Unit 4)</option>
                    <option value="Module 5">Module 5 (Unit 5)</option>
                    <option value="Important Topics">Important Topics & Quick Revision</option>
                    <option value="Reference Materials">Reference Handouts & IS Codes</option>
                    <option value="custom">✏️ Custom Unit Name...</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono font-semibold text-concrete-500 mb-1 block">
                    2. Module Part / Section (Optional)
                  </label>
                  <select
                    disabled={selectedModule === 'custom'}
                    value={selectedPart}
                    onChange={(e) => setSelectedPart(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white text-xs font-mono disabled:opacity-40"
                  >
                    <option value="">Full / Single Part Module</option>
                    <option value="Part 1">Part 1</option>
                    <option value="Part 2">Part 2</option>
                    <option value="Part 3">Part 3</option>
                    <option value="Part 4">Part 4</option>
                    <option value="Part A">Part A</option>
                    <option value="Part B">Part B</option>
                    <option value="Part C">Part C</option>
                    <option value="custom">✏️ Custom Part Name...</option>
                  </select>
                </div>
              </div>

              {/* Text input if user chooses Custom Unit or Custom Part */}
              {(selectedModule === 'custom' || (selectedPart === 'custom' && selectedModule !== 'custom')) && (
                <div className="pt-1">
                  <label className="text-[11px] font-mono font-semibold text-concrete-500 mb-1 block">
                    {selectedModule === 'custom' ? 'Custom Module / Unit Name' : `Custom Part Name for ${selectedModule}`}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      selectedModule === 'custom'
                        ? 'e.g. Unit 6: Advanced Foundation Engineering'
                        : 'e.g. Part 1 - Bending Moment Analysis'
                    }
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-blueprint-400 dark:border-blueprint-600 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white text-xs font-mono"
                  />
                </div>
              )}
            </div>
          )}

          {category === 'question_paper' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-concrete-50 dark:bg-concrete-800/50 border border-concrete-200 dark:border-concrete-700/80">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300">
                  Examination Type
                </label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value as ExamType)}
                  className="w-full p-2.5 rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white text-xs font-mono"
                >
                  <option value="Semester Examination">Semester Regular Examination</option>
                  <option value="Previous Year Examination">Previous Year Examination (PYQ)</option>
                  <option value="Supply Examination">Supplementary Examination</option>
                  <option value="Internal Examination">Internal Assessment / Midterm</option>
                  <option value="Model Examination">Model Question Paper</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300">
                  Exam Year
                </label>
                <select
                  value={examYear}
                  onChange={(e) => setExamYear(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white text-xs font-mono"
                >
                  {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map((y) => (
                    <option key={y} value={y}>
                      {y} University Examination
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {category === 'supply' && (
            <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/80 space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-amber-900 dark:text-safety">
                Supply Special Vault Category
              </label>
              <select
                value={supplyCategory}
                onChange={(e) => setSupplyCategory(e.target.value as SupplyCategory)}
                className="w-full p-2.5 rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white text-xs font-mono"
              >
                <option value="Formula Sheets">Formula Sheets & Quick Handouts</option>
                <option value="Important Derivations">Important Theory Derivations</option>
                <option value="Solved Question Papers">5-Year Solved Question Papers</option>
                <option value="Last-Minute Revision Notes">Last-Minute Revision Notes</option>
                <option value="Frequently Asked Questions">Frequently Asked Questions (FAQ)</option>
              </select>
            </div>
          )}

          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-concrete-600 dark:text-concrete-300">
              4. Document Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CE501: Limit State Design of Singly Reinforced Beams (IS 456)"
              className="w-full px-4 py-3 rounded-2xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white text-sm focus:ring-2 focus:ring-blueprint-500 shadow-sm"
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-concrete-600 dark:text-concrete-300">
              5. Summary Description & Academic Context
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide key topics covered, relevant IS clauses, worked numericals, or structural diagrams included."
              className="w-full px-4 py-3 rounded-2xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white text-sm focus:ring-2 focus:ring-blueprint-500 shadow-sm"
            />
          </div>

          {/* File Picker */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-concrete-600 dark:text-concrete-300">
              6. Select Academic File (PDF, DOCX, ZIP) *
            </label>
            <div className="border-2 border-dashed border-concrete-300 dark:border-concrete-700 hover:border-blueprint-500 dark:hover:border-blueprint-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-concrete-50/50 dark:bg-concrete-850/50">
              <input
                type="file"
                required
                accept=".pdf,.doc,.docx,.zip,.png,.jpg"
                onChange={handleFileChange}
                className="w-full text-xs font-mono cursor-pointer"
              />
              {selectedFile ? (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                  {selectedFile.size > 8 * 1024 * 1024 && (
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] font-mono text-amber-800 dark:text-amber-300 text-left">
                      💡 <strong>Tip for faster uploads:</strong> This file is {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB. Compressing PDFs before uploading (e.g. reducing scan resolution or using a PDF compressor) makes uploads significantly faster for you and your students.
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-xs font-mono text-concrete-400">
                  Maximum file size: 25 MB • High-resolution architectural drawings and PDF lecture notes supported.
                </p>
              )}
            </div>
          </div>

          {/* Real-Time Upload Progress Indicator */}
          {isUploading && (
            <div className="p-5 rounded-2xl bg-white dark:bg-concrete-900 border-2 border-blueprint-500/40 dark:border-blueprint-500/30 shadow-lg space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-blueprint-700 dark:text-blueprint-300 font-bold">
                  <span className="h-2.5 w-2.5 rounded-full bg-blueprint-500 animate-ping" />
                  <span>{uploadProgressMsg}</span>
                </div>
                <span className="font-heading font-extrabold text-sm text-blueprint-700 dark:text-safety">
                  {uploadPercent}%
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-3 bg-concrete-100 dark:bg-concrete-800 rounded-full overflow-hidden p-0.5 border border-concrete-200 dark:border-concrete-700">
                <div
                  className="h-full bg-gradient-to-r from-blueprint-600 via-blueprint-500 to-safety rounded-full transition-all duration-150 ease-out"
                  style={{ width: `${uploadPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-concrete-500">
                <span>{bytesProgress || 'Streaming data payload...'}</span>
                {uploadSpeed && (
                  <span className="font-semibold text-concrete-600 dark:text-concrete-300">
                    ⚡ {uploadSpeed}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4 border-t border-concrete-200 dark:border-concrete-800">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate('/admin/manage')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="safety"
              size="lg"
              disabled={isUploading || !selectedFile}
              icon={<UploadCloud className="h-5 w-5" />}
            >
              {isUploading ? 'Uploading to Supabase...' : 'Confirm & Upload to Vault'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

