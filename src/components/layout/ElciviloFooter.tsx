import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, BookOpen, Layers, ExternalLink, HardHat, Github } from 'lucide-react';
import { semestersData } from '../../data/initialData';

export const ElciviloFooter: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-concrete-300 dark:border-concrete-800/80 bg-white dark:bg-concrete-950 text-concrete-600 dark:text-concrete-400 transition-colors">
      {/* Drafting ruler tick marks decoration */}
      <div className="w-full h-2 bg-concrete-100 dark:bg-concrete-900 border-b border-concrete-200 dark:border-concrete-800 flex justify-between px-2 overflow-hidden opacity-60">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className={`w-[1px] bg-concrete-400 dark:bg-concrete-700 ${i % 10 === 0 ? 'h-2 bg-blueprint-600 dark:bg-blueprint-400' : i % 5 === 0 ? 'h-1.5' : 'h-1'
              }`}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1 & 2: Brand Identity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-blueprint-800 text-safety border border-blueprint-600/60 shadow-sm">
                <Compass className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="font-heading font-extrabold text-2xl tracking-tight text-concrete-900 dark:text-white">
                  Elcivilo
                </span>
                <p className="font-mono text-xs text-concrete-500">Civil Engineering Academic Portal</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-concrete-600 dark:text-concrete-400 leading-relaxed max-w-sm">
              The premier structured knowledge hub designed specifically for Civil Engineering students. Access lecture notes, standard textbooks, IS codes, previous year question papers, and assignments across all eight academic semesters.
            </p>

            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <span className="font-mono text-[11px] px-2.5 py-1 rounded-lg bg-blueprint-50 text-blueprint-800 dark:bg-blueprint-950 dark:text-blueprint-300 border border-blueprint-200 dark:border-blueprint-800 font-semibold">
                IS 456:2000 Compliant
              </span>
              <span className="font-mono text-[11px] px-2.5 py-1 rounded-lg bg-steel/10 text-steel-dark dark:text-steel-light border border-steel/20 font-semibold">
                IS 800:2007 Steel
              </span>
              <span className="font-mono text-[11px] px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-safety border border-safety/40 font-semibold">
                IS 1893 Seismic
              </span>
            </div>
          </div>

          {/* Col 3: Quick Semester Jump */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-concrete-900 dark:text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blueprint-600 dark:text-blueprint-400" />
              <span>Semesters</span>
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              {semestersData.map((s) => (
                <li key={s.semester}>
                  <Link
                    to={`/semester/${s.semester}`}
                    className="hover:text-blueprint-600 dark:hover:text-blueprint-400 transition-colors flex items-center justify-between group"
                  >
                    <span>{s.roman} — {s.title.split('&')[0]}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blueprint-600 dark:text-blueprint-400">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Quick Navigation & Tools */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-concrete-900 dark:text-white flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-safety-amber" />
              <span>Academic Tools</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/notifications" className="hover:text-blueprint-600 dark:hover:text-blueprint-400 transition-colors">
                  Notifications & Circulars
                </Link>
              </li>
              <li>
                <Link to="/sgpa" className="hover:text-blueprint-600 dark:hover:text-blueprint-400 transition-colors">
                  Civil SGPA & CGPA Calculator
                </Link>
              </li>
              <li>
                <Link to="/saved" className="hover:text-blueprint-600 dark:hover:text-blueprint-400 transition-colors">
                  Personal Saved Notes Vault
                </Link>
              </li>
              <li>
                <Link to="/semester/5" className="hover:text-blueprint-600 dark:hover:text-blueprint-400 transition-colors">
                  RCC Design & IS 456 Hub
                </Link>
              </li>
              <li>
                <Link to="/semester/6" className="hover:text-blueprint-600 dark:hover:text-blueprint-400 transition-colors">
                  Steel Structures & IS 800 Hub
                </Link>
              </li>
              <li>
                <Link to="/semester/4" className="hover:text-blueprint-600 dark:hover:text-blueprint-400 transition-colors">
                  Soil Mechanics & Geotech Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Faculty & Repository Specs */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-concrete-900 dark:text-white flex items-center gap-1.5">
              <HardHat className="w-4 h-4 text-safety" />
              <span>Administration</span>
            </h4>
            <p className="text-xs text-concrete-500 leading-relaxed font-mono">
              Faculty educators and laboratory instructors can log into the secure dashboard to publish syllabus revisions and assignment questions.
            </p>
            <div className="pt-2">
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-100 dark:bg-concrete-900 text-xs font-semibold text-concrete-800 dark:text-concrete-200 hover:border-blueprint-500 transition-all"
              >
                <span>Faculty Login Portal</span>
                <ExternalLink className="w-3 h-3 text-concrete-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-concrete-200 dark:border-concrete-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-concrete-500">
          <p>© {new Date().getFullYear()} Elcivilo Academic Portal. All structural engineering rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Built for Civil Engineers</span>
            <span>•</span>
            <a
              href="https://github.com/ManeOfStrings"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-concrete-900 dark:hover:text-white transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Two-Tier Architecture by ManeOfStrings</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
