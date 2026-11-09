import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Dynamic time-based greeting for students
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Exactly Semester 1 through Semester 8
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16 py-4">
      {/* Minimal, Professional Civil Engineering Hero */}
      <section className="text-center space-y-4 pt-4 sm:pt-8">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blueprint-100/80 dark:bg-blueprint-950/70 text-blueprint-800 dark:text-blueprint-200 font-mono text-xs font-semibold border border-blueprint-300 dark:border-blueprint-800 shadow-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{getGreeting()}, Engineer 👋</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-concrete-200/80 dark:bg-concrete-800 text-concrete-700 dark:text-concrete-300 font-mono text-xs font-semibold uppercase tracking-wider border border-concrete-300 dark:border-concrete-700">
            <Compass className="w-3.5 h-3.5 text-blueprint-600 dark:text-blueprint-400" />
            <span>Department of Civil Engineering</span>
          </div>
        </div>

        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-concrete-900 dark:text-white tracking-tight">
          Elcivilo Academic Portal
        </h1>

        <p className="text-sm sm:text-base text-concrete-600 dark:text-concrete-400 max-w-2xl mx-auto font-sans leading-relaxed">
          Open repository for civil engineering students. Select your semester below to view subjects, syllabus, lecture notes, textbooks, assignments, and previous year examination papers.
        </p>
      </section>

      {/* Clean, Modern Grid of Semesters as Solid Buttons with Minimal Text */}
      <section className="space-y-4">
        <div className="text-center">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-concrete-500">
            Select Academic Semester
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
          {semesters.map((sem) => (
            <button
              key={sem}
              onClick={() => navigate(`/semester/${sem}`)}
              className="group relative flex items-center justify-between p-3.5 sm:p-7 rounded-xl sm:rounded-2xl bg-white dark:bg-concrete-900 border-2 border-concrete-300 dark:border-concrete-800 hover:border-blueprint-600 dark:hover:border-blueprint-400 hover:bg-blueprint-700 dark:hover:bg-blueprint-700 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-blueprint text-left"
            >
              <div className="min-w-0">
                <span className="font-mono text-[10px] sm:text-xs text-concrete-400 dark:text-concrete-500 group-hover:text-blueprint-200 uppercase font-semibold block mb-0.5 sm:mb-1">
                  Term 0{sem}
                </span>
                <span className="font-heading font-bold sm:font-extrabold text-sm sm:text-2xl text-concrete-900 dark:text-white group-hover:text-white transition-colors truncate block">
                  Semester {sem}
                </span>
              </div>

              <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-concrete-100 dark:bg-concrete-800 group-hover:bg-white/20 text-concrete-600 dark:text-concrete-300 group-hover:text-white flex items-center justify-center transition-colors shrink-0 ml-1 sm:ml-0">
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Plain, professional informational note */}
      <section className="p-6 rounded-2xl border border-concrete-300 dark:border-concrete-800 bg-white/60 dark:bg-concrete-900/60 text-xs font-mono text-concrete-500 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <span>Public student repository • No login required • Strict Two-Tier Architecture</span>
        <span className="text-concrete-400">IS 456 / IS 800 / IS 1893 Compliant</span>
      </section>
    </div>
  );
};
