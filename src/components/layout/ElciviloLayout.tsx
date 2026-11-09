import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { ElciviloNavbar } from './ElciviloNavbar';
import { ElciviloFooter } from './ElciviloFooter';
import { FilePreviewModal } from '../common/FilePreviewModal';
import { SearchModal } from '../common/SearchModal';
import { UploadModal } from '../common/UploadModal';
import { ToastContainer } from '../common/ToastContainer';
import { ParticlesBackground } from '../common/ParticlesBackground';
import { usePortal } from '../../context/PortalContext';
import { semestersData } from '../../data/initialData';

export const ElciviloLayout: React.FC = () => {
  const location = useLocation();
  const { getSubjectById } = usePortal();

  // Extract path params for breadcrumbs
  const pathParts = location.pathname.split('/').filter(Boolean);
  const isSemester = pathParts[0] === 'semester' && pathParts[1];
  const isSubject = isSemester && pathParts[2] === 'subject' && pathParts[3];

  const currentSem = isSemester ? semestersData.find((s) => s.semester === Number(pathParts[1])) : null;
  const currentSub = isSubject ? getSubjectById(pathParts[3]) : null;

  return (
    <div className="min-h-screen flex flex-col bg-concrete-100 dark:bg-concrete-950 text-concrete-900 dark:text-concrete-100 transition-colors duration-200 relative selection:bg-safety/40 selection:text-concrete-950">
      {/* Background Architectural Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none bg-blueprint-grid opacity-60 dark:opacity-40 z-0" />

      {/* Dynamic Interactive Truss Particles */}
      <ParticlesBackground />

      {/* Main Navbar */}
      <ElciviloNavbar />

      {/* Breadcrumbs (shown on sub-pages) */}
      {location.pathname !== '/' && (
        <div className="w-full border-b border-concrete-200 dark:border-concrete-800/80 bg-concrete-50/70 dark:bg-concrete-900/50 backdrop-blur-xs relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
            <nav className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono text-concrete-500 overflow-x-auto whitespace-nowrap">
              <Link
                to="/"
                className="flex items-center gap-1 hover:text-blueprint-600 dark:hover:text-blueprint-400 transition-colors shrink-0"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>

              {isSemester && currentSem && (
                <>
                  <ChevronRight className="w-3 h-3 text-concrete-400 shrink-0" />
                  <Link
                    to={`/semester/${currentSem.semester}`}
                    className={`hover:text-blueprint-600 dark:hover:text-blueprint-400 transition-colors shrink-0 ${
                      !isSubject ? 'text-blueprint-700 dark:text-blueprint-300 font-bold' : ''
                    }`}
                  >
                    <span className="font-bold">{currentSem.roman}</span>: {currentSem.title.split('&')[0]}
                  </Link>
                </>
              )}

              {isSubject && currentSub && (
                <>
                  <ChevronRight className="w-3 h-3 text-concrete-400 shrink-0" />
                  <span className="text-blueprint-700 dark:text-blueprint-300 font-bold shrink-0">
                    {currentSub.code}: {currentSub.name}
                  </span>
                </>
              )}

              {location.pathname === '/notifications' && (
                <>
                  <ChevronRight className="w-3 h-3 text-concrete-400 shrink-0" />
                  <span className="text-blueprint-700 dark:text-blueprint-300 font-bold shrink-0">
                    Notifications
                  </span>
                </>
              )}

              {location.pathname === '/sgpa' && (
                <>
                  <ChevronRight className="w-3 h-3 text-concrete-400 shrink-0" />
                  <span className="text-blueprint-700 dark:text-blueprint-300 font-bold shrink-0">
                    SGPA & CGPA Grade Calculator
                  </span>
                </>
              )}

              {location.pathname === '/saved' && (
                <>
                  <ChevronRight className="w-3 h-3 text-concrete-400 shrink-0" />
                  <span className="text-blueprint-700 dark:text-blueprint-300 font-bold shrink-0">
                    Saved Academic Vault
                  </span>
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative z-10">
        <Outlet />
      </main>

      {/* Global Modals & Notifications */}
      <FilePreviewModal />
      <SearchModal />
      <UploadModal />
      <ToastContainer />

      {/* Main Footer */}
      <ElciviloFooter />
    </div>
  );
};
