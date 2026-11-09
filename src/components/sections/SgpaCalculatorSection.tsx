import React, { useState, useEffect, useMemo } from 'react';
import {
  Calculator,
  Plus,
  Trash2,
  RotateCcw,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  Sparkles,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { BlueprintCard } from '../common/BlueprintCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  SgpaCourseItem,
  GRADE_SCALE,
  calculateSgpa,
} from '../../utils/formatters';

const STORAGE_KEY = 'ce_portal_sgpa_v4';

// Purge legacy calculator storage keys
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    [1, 2, 3, 4, 5, 6, 7, 8].forEach((s) => {
      localStorage.removeItem(`ce_portal_sgpa_v2_sem_${s}`);
      localStorage.removeItem(`ce_portal_sgpa_v3_sem_${s}`);
    });
  }
} catch {
  // ignore
}

export const SgpaCalculatorSection: React.FC = () => {
  const { selectedSemester, setSelectedSemester, getSubjectsBySemester, showToast } = usePortal();
  const [activeSem, setActiveSem] = useState<number>(selectedSemester || 1);
  const [targetSgpa, setTargetSgpa] = useState<number>(8.5);
  const [showGradingScale, setShowGradingScale] = useState(false);
  const [inputMode, setInputMode] = useState<'grade' | 'marks'>('grade');

  const getInitialCourses = (sem: number): SgpaCourseItem[] => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_sem_${sem}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    const semSubjects = getSubjectsBySemester(sem);
    if (semSubjects && semSubjects.length > 0) {
      return semSubjects.map((s, idx) => ({
        id: `course_${sem}_${s.id}_${idx}`,
        code: s.code,
        name: s.name,
        credits: s.credits,
        gradePoint: 8,
        isLab: s.name.toLowerCase().includes('lab') || s.credits < 3,
      }));
    }
    return [];
  };

  // Load saved state or default to current semester subjects
  const [courses, setCourses] = useState<SgpaCourseItem[]>(() => getInitialCourses(activeSem));

  // Keep active semester synchronized with global navbar
  useEffect(() => {
    if (selectedSemester && selectedSemester !== activeSem) {
      handleSemesterChange(selectedSemester);
    }
  }, [selectedSemester]);

  // Persist courses whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_sem_${activeSem}`, JSON.stringify(courses));
    } catch {
      // storage disabled
    }
  }, [courses, activeSem]);

  const handleSemesterChange = (sem: number) => {
    setActiveSem(sem);
    if (setSelectedSemester) {
      setSelectedSemester(sem);
    }
    setCourses(getInitialCourses(sem));
  };

  const handleReset = () => {
    try {
      localStorage.removeItem(`${STORAGE_KEY}_sem_${activeSem}`);
    } catch {
      // ignore
    }
    setCourses(getInitialCourses(activeSem));
    showToast('Reset course list for Semester ' + activeSem, 'info');
  };

  const handleAddCourse = () => {
    const newCourse: SgpaCourseItem = {
      id: `custom_${Date.now()}`,
      code: `Course ${courses.length + 1}`,
      name: `Course Subject ${courses.length + 1}`,
      credits: 4,
      gradePoint: 8,
      isLab: false,
    };
    setCourses([...courses, newCourse]);
    showToast('New course added to calculation schedule', 'success');
  };

  const handleRemoveCourse = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  const handleUpdateCourse = (id: string, updates: Partial<SgpaCourseItem>) => {
    setCourses(courses.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const handleMarksInput = (id: string, marks: number) => {
    const clamped = Math.max(0, Math.min(100, marks));
    const matched = GRADE_SCALE.find((g) => clamped >= (g.minMarks ?? 0)) || GRADE_SCALE[GRADE_SCALE.length - 1];
    handleUpdateCourse(id, { gradePoint: matched.points });
  };

  // Perform calculation
  const stats = useMemo(() => {
    return calculateSgpa(courses);
  }, [courses]);

  // Target SGPA planner analysis
  const targetAnalysis = useMemo(() => {
    if (stats.totalCredits === 0) return null;
    const requiredTotalPoints = targetSgpa * stats.totalCredits;
    const diffPoints = requiredTotalPoints - stats.totalPoints;
    const isAchieved = stats.sgpa >= targetSgpa;

    return {
      isAchieved,
      diffPoints: Math.round(diffPoints * 10) / 10,
      targetSgpa,
    };
  }, [stats, targetSgpa]);

  const handleCopySummary = () => {
    const text = `--- CIVIL ENGINEERING ACADEMIC PORTAL ---
Semester ${activeSem} SGPA Calculation Report:
SGPA: ${stats.sgpa.toFixed(2)} / 10.00
Classification: ${stats.classification}
Total Credits: ${stats.totalCredits} (${stats.earnedCredits} Earned)
Percentage Equivalent: ${stats.percentageStandard}% (Standard) | ${stats.percentageAicte}% (AICTE)

Course Breakdown:
${courses
  .map(
    (c) =>
      `• ${c.code}: ${c.name} - ${c.credits} Credits | Grade Point: ${c.gradePoint}/10 (${
        GRADE_SCALE.find((g) => g.points === c.gradePoint)?.letter || 'P'
      })`
  )
  .join('\n')}
Generated via Civil Engineering Academic Deck`;

    navigator.clipboard.writeText(text);
    showToast('Academic SGPA report copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-10 lg:p-12 rounded-3xl bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-800 shadow-sm">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xs px-3 py-1 rounded-lg bg-blueprint-100 text-blueprint-800 dark:bg-blueprint-950 dark:text-blueprint-300 border border-blueprint-300 dark:border-blueprint-800 font-bold">
              MODULE 08 • ACADEMIC EVALUATION
            </span>
            <span className="text-xs font-mono text-concrete-500">10-Point UGC & AICTE Standard</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-concrete-900 dark:text-white tracking-tight">
            SGPA & Honors Grade Calculator
          </h1>
          <p className="text-sm sm:text-base text-concrete-600 dark:text-concrete-400 leading-relaxed font-sans">
            Calculate your Semester Grade Point Average with accredited credit weightages, simulate target GPA scenarios, and convert to university percentage equivalents.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="concrete"
            size="md"
            icon={<RotateCcw className="h-4 w-4" />}
            onClick={handleReset}
            title="Reset to official syllabus defaults"
          >
            Reset Defaults
          </Button>
          <Button
            variant="blueprint"
            size="md"
            icon={<Copy className="h-4 w-4" />}
            onClick={handleCopySummary}
          >
            Copy Summary
          </Button>
        </div>
      </div>

      {/* Semester Selector & Configuration Strip */}
      <div className="bg-white dark:bg-concrete-900 p-4 sm:p-6 rounded-3xl border border-concrete-300 dark:border-concrete-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Semester Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs font-mono text-concrete-500 uppercase font-semibold mr-1.5 shrink-0">
              Semester:
            </span>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <button
                key={s}
                onClick={() => handleSemesterChange(s)}
                className={`px-3 py-1.5 rounded-xl font-heading text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeSem === s
                    ? 'bg-blueprint-700 text-white shadow-blueprint'
                    : 'bg-concrete-100 dark:bg-concrete-800 text-concrete-700 dark:text-concrete-300 hover:bg-concrete-200'
                }`}
              >
                Sem {s}
              </button>
            ))}
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-mono text-concrete-500 font-medium">Input by:</span>
            <div className="inline-flex rounded-xl bg-concrete-100 dark:bg-concrete-800 p-1">
              <button
                onClick={() => setInputMode('grade')}
                className={`px-3 py-1 rounded-lg text-xs font-heading font-semibold transition-all cursor-pointer ${
                  inputMode === 'grade'
                    ? 'bg-white dark:bg-concrete-700 text-concrete-900 dark:text-white shadow-xs'
                    : 'text-concrete-500 hover:text-concrete-900'
                }`}
              >
                Letter Grade
              </button>
              <button
                onClick={() => setInputMode('marks')}
                className={`px-3 py-1 rounded-lg text-xs font-heading font-semibold transition-all cursor-pointer ${
                  inputMode === 'marks'
                    ? 'bg-white dark:bg-concrete-700 text-concrete-900 dark:text-white shadow-xs'
                    : 'text-concrete-500 hover:text-concrete-900'
                }`}
              >
                Marks (0-100)
              </button>
            </div>

            <button
              onClick={() => setShowGradingScale(!showGradingScale)}
              className="p-1.5 rounded-xl text-concrete-500 hover:text-blueprint-600 hover:bg-concrete-100 dark:hover:bg-concrete-800 transition-colors"
              title="Toggle 10-Point Grade Scale Reference"
            >
              <HelpCircle className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Optional 10-Point Scale Reference Table */}
        {showGradingScale && (
          <div className="pt-4 border-t border-concrete-200 dark:border-concrete-800 animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono uppercase font-bold text-concrete-600 dark:text-concrete-400">
                UGC & AICTE 10-Point Relative Grading Schema
              </span>
              <span className="text-[11px] font-mono text-concrete-400">Civil Engineering Norms</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {GRADE_SCALE.map((g) => (
                <div
                  key={g.letter}
                  className="p-2.5 rounded-xl bg-concrete-50 dark:bg-concrete-950 border border-concrete-200 dark:border-concrete-800 text-center space-y-0.5"
                >
                  <div className="font-heading font-extrabold text-sm text-blueprint-700 dark:text-blueprint-300">
                    Grade {g.letter}
                  </div>
                  <div className="font-mono text-xs font-bold text-concrete-900 dark:text-white">
                    {g.points} Points
                  </div>
                  <div className="font-sans text-[10px] text-concrete-500 truncate">
                    {g.label.split(' ')[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Real-Time Live Results Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Calculated SGPA */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-blueprint-900 to-blueprint-950 text-white border border-blueprint-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-safety/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs uppercase tracking-wider text-blueprint-200 font-bold">
                Calculated SGPA
              </span>
              <span className="h-2 w-2 rounded-full bg-safety animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-safety to-amber-300 tracking-tight">
                {stats.sgpa.toFixed(2)}
              </span>
              <span className="font-mono text-sm text-blueprint-300">/ 10.00</span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-blueprint-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-blueprint-200 font-semibold">{stats.classification}</span>
          </div>
        </div>

        {/* Card 2: Total Credits */}
        <div className="p-6 rounded-3xl bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs uppercase tracking-wider text-concrete-500 font-bold">
                Semester Credits
              </span>
              <Layers className="h-5 w-5 text-blueprint-600 dark:text-blueprint-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-4xl sm:text-5xl font-extrabold text-concrete-900 dark:text-white tracking-tight">
                {stats.totalCredits}
              </span>
              <span className="font-mono text-xs text-concrete-500">Credits Registered</span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-concrete-100 dark:border-concrete-800 flex items-center justify-between text-xs font-mono text-concrete-600 dark:text-concrete-400">
            <span>Earned Credits:</span>
            <strong className="text-emerald-600 dark:text-emerald-400">{stats.earnedCredits} / {stats.totalCredits}</strong>
          </div>
        </div>

        {/* Card 3: Percentage Equivalents */}
        <div className="p-6 rounded-3xl bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs uppercase tracking-wider text-concrete-500 font-bold">
                Percentage Equivalent
              </span>
              <TrendingUp className="h-5 w-5 text-steel" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-4xl sm:text-5xl font-extrabold text-concrete-900 dark:text-white tracking-tight">
                {stats.percentageStandard}%
              </span>
              <span className="font-mono text-xs text-concrete-500">Standard</span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-concrete-100 dark:border-concrete-800 flex items-center justify-between text-xs font-mono text-concrete-600 dark:text-concrete-400">
            <span>AICTE (SGPA-0.75)×10:</span>
            <strong className="text-blueprint-700 dark:text-blueprint-300">{stats.percentageAicte}%</strong>
          </div>
        </div>

        {/* Card 4: Academic Honours Classification */}
        <div className="p-6 rounded-3xl bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs uppercase tracking-wider text-concrete-500 font-bold">
                Academic Standing
              </span>
              <Award className="h-5 w-5 text-amber-500" />
            </div>
            <div className="space-y-1">
              <Badge
                variant={
                  stats.hasBacklog
                    ? 'danger'
                    : stats.sgpa >= 8.5
                    ? 'safety'
                    : stats.sgpa >= 7.0
                    ? 'blueprint'
                    : 'concrete'
                }
                size="md"
              >
                {stats.hasBacklog ? 'Backlog Alert' : stats.sgpa >= 8.5 ? 'Honours Candidate' : 'Cleared'}
              </Badge>
              <p className="font-heading font-bold text-sm text-concrete-900 dark:text-white pt-1">
                {stats.classification}
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-concrete-100 dark:border-concrete-800 text-xs font-mono text-concrete-500">
            <span>IS 456 & AICTE Scheme</span>
          </div>
        </div>
      </div>

      {/* Target SGPA Scenario Planner */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-blueprint-50/70 via-white to-amber-50/40 dark:from-blueprint-950/40 dark:via-concrete-900 dark:to-amber-950/20 border border-blueprint-200 dark:border-blueprint-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-safety" />
              <h3 className="font-heading font-bold text-base text-concrete-900 dark:text-white">
                Target SGPA Scenario Planner
              </h3>
            </div>
            <p className="text-xs text-concrete-600 dark:text-concrete-400 font-sans">
              Set an aspirational SGPA target for Semester {activeSem} to track performance requirements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold text-concrete-500">Target SGPA:</span>
            <input
              type="number"
              min="4"
              max="10"
              step="0.1"
              value={targetSgpa}
              onChange={(e) => setTargetSgpa(Number(e.target.value) || 8.0)}
              className="w-20 px-3 py-1.5 text-sm font-heading font-bold rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white shadow-xs focus:ring-2 focus:ring-blueprint-500"
            />
          </div>
        </div>

        {targetAnalysis && (
          <div className="p-4 rounded-2xl bg-white dark:bg-concrete-900 border border-concrete-200 dark:border-concrete-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              {targetAnalysis.isAchieved ? (
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
              ) : (
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
              )}
              <span className="text-concrete-700 dark:text-concrete-300 font-sans">
                {targetAnalysis.isAchieved
                  ? `Congratulations! Current SGPA (${stats.sgpa.toFixed(2)}) meets your goal of ${targetSgpa.toFixed(2)}.`
                  : `Currently ${Math.abs(targetAnalysis.diffPoints)} grade points away from achieving ${targetSgpa.toFixed(2)} SGPA.`}
              </span>
            </div>
            <span className="font-bold text-blueprint-700 dark:text-blueprint-300 shrink-0">
              {targetAnalysis.isAchieved ? 'Target Met' : 'Upgrade 1-2 Subject Grades to Reach Target'}
            </span>
          </div>
        )}
      </div>

      {/* Interactive Courses & Grades Table */}
      <BlueprintCard
        title={`Semester ${activeSem} Courses & Grade Schedule`}
        subtitle="Edit course titles, adjust credits, and change earned grades in real-time"
        action={
          <Button
            variant="blueprint"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={handleAddCourse}
          >
            Add Subject
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm font-sans min-w-[650px]">
            <thead>
              <tr className="border-b border-concrete-200 dark:border-concrete-800 text-concrete-400 font-mono text-xs">
                <th className="pb-3 font-semibold">COURSE CODE</th>
                <th className="pb-3 font-semibold">SUBJECT TITLE</th>
                <th className="pb-3 font-semibold text-center">TYPE</th>
                <th className="pb-3 font-semibold text-center">CREDITS</th>
                <th className="pb-3 font-semibold">
                  {inputMode === 'grade' ? 'LETTER GRADE' : 'MARKS (0-100)'}
                </th>
                <th className="pb-3 font-semibold text-center">PTS</th>
                <th className="pb-3 font-semibold text-right">CREDIT × PTS</th>
                <th className="pb-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-concrete-100 dark:divide-concrete-800">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-concrete-500 font-mono text-xs">
                    No courses configured for Semester {activeSem}. Click &ldquo;Add Subject&rdquo; above to add courses and calculate your SGPA.
                  </td>
                </tr>
              ) : (
                courses.map((course) => {
                  const weightedPoints = (Number(course.credits) || 0) * (Number(course.gradePoint) || 0);
                  const currentGradeObj = GRADE_SCALE.find((g) => g.points === course.gradePoint) || GRADE_SCALE[0];

                return (
                  <tr
                    key={course.id}
                    className="hover:bg-concrete-50/80 dark:hover:bg-concrete-800/40 transition-colors"
                  >
                    {/* Course Code */}
                    <td className="py-3.5 pr-3 font-mono font-bold text-blueprint-700 dark:text-blueprint-300">
                      <input
                        type="text"
                        value={course.code}
                        onChange={(e) => handleUpdateCourse(course.id, { code: e.target.value })}
                        className="w-24 bg-transparent border-b border-transparent hover:border-concrete-300 focus:border-blueprint-500 focus:outline-none"
                      />
                    </td>

                    {/* Course Name */}
                    <td className="py-3.5 pr-3 font-medium text-concrete-900 dark:text-white">
                      <input
                        type="text"
                        value={course.name}
                        onChange={(e) => handleUpdateCourse(course.id, { name: e.target.value })}
                        className="w-full bg-transparent border-b border-transparent hover:border-concrete-300 focus:border-blueprint-500 focus:outline-none"
                      />
                    </td>

                    {/* Type Badge */}
                    <td className="py-3.5 px-2 text-center">
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                          course.isLab
                            ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : 'bg-blueprint-50 dark:bg-blueprint-950/70 text-blueprint-700 dark:text-blueprint-300 border border-blueprint-200 dark:border-blueprint-800'
                        }`}
                      >
                        {course.isLab ? 'LAB' : 'THEORY'}
                      </span>
                    </td>

                    {/* Credits */}
                    <td className="py-3.5 px-2 text-center">
                      <select
                        value={course.credits}
                        onChange={(e) => handleUpdateCourse(course.id, { credits: Number(e.target.value) })}
                        className="px-2 py-1 text-xs font-mono font-bold rounded-lg border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blueprint-500 cursor-pointer"
                      >
                        <option value={1}>1.0</option>
                        <option value={1.5}>1.5</option>
                        <option value={2}>2.0</option>
                        <option value={3}>3.0</option>
                        <option value={4}>4.0</option>
                        <option value={5}>5.0</option>
                        <option value={6}>6.0</option>
                        <option value={8}>8.0</option>
                      </select>
                    </td>

                    {/* Grade Selector or Marks Input */}
                    <td className="py-3.5 pr-3">
                      {inputMode === 'grade' ? (
                        <select
                          value={course.gradePoint}
                          onChange={(e) => handleUpdateCourse(course.id, { gradePoint: Number(e.target.value) })}
                          className={`px-3 py-1.5 text-xs font-heading font-bold rounded-xl border bg-white dark:bg-concrete-800 focus:outline-none focus:ring-2 focus:ring-blueprint-500 cursor-pointer ${
                            course.gradePoint === 0
                              ? 'border-rose-400 text-rose-600 dark:text-rose-400'
                              : course.gradePoint >= 9
                              ? 'border-emerald-400 text-emerald-700 dark:text-emerald-400'
                              : 'border-concrete-300 dark:border-concrete-700 text-concrete-900 dark:text-white'
                          }`}
                        >
                          {GRADE_SCALE.map((g) => (
                            <option key={g.letter} value={g.points}>
                              {g.letter} ({g.points} pts) - {g.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Marks"
                            defaultValue={currentGradeObj.minMarks ?? 75}
                            onChange={(e) => handleMarksInput(course.id, Number(e.target.value))}
                            className="w-20 px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blueprint-500"
                          />
                          <span className="font-mono text-xs font-bold text-blueprint-600 dark:text-blueprint-400">
                            → {currentGradeObj.letter}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Grade Points */}
                    <td className="py-3.5 px-2 text-center font-mono font-bold text-concrete-700 dark:text-concrete-300">
                      {course.gradePoint}
                    </td>

                    {/* Weighted Points */}
                    <td className="py-3.5 pr-2 text-right font-mono font-bold text-blueprint-700 dark:text-blueprint-300">
                      {weightedPoints.toFixed(1)}
                    </td>

                    {/* Delete action */}
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleRemoveCourse(course.id)}
                        className="p-1.5 text-concrete-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-concrete-200 dark:border-concrete-800 font-mono text-xs font-bold text-concrete-900 dark:text-white">
                <td colSpan={3} className="py-4">
                  TOTAL SEMESTER CREDITS & POINTS
                </td>
                <td className="py-4 text-center text-blueprint-700 dark:text-blueprint-300">
                  {stats.totalCredits}
                </td>
                <td colSpan={2} className="py-4 text-right">
                  SGPA:
                </td>
                <td className="py-4 text-right text-lg text-safety">
                  {stats.sgpa.toFixed(2)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </BlueprintCard>
    </div>
  );
};

