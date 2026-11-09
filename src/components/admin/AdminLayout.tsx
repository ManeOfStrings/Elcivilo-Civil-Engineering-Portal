import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  LayoutDashboard,
  UploadCloud,
  Layers,
  FileText,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Plus,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { FilePreviewModal } from '../common/FilePreviewModal';
import { ToastContainer } from '../common/ToastContainer';

export const AdminLayout: React.FC = () => {
  const { user, logoutAdmin } = useAuth();
  const { showToast } = usePortal();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logoutAdmin();
    showToast('Admin session logged out successfully', 'info');
    navigate('/admin/login', { replace: true });
  };

  const navLinks = [
    {
      to: '/admin/dashboard',
      label: 'Executive Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      to: '/admin/upload',
      label: 'Upload Resource',
      icon: <UploadCloud className="h-5 w-5" />,
    },
    {
      to: '/admin/manage',
      label: 'Curriculum & Notices',
      icon: <Layers className="h-5 w-5" />,
    },
    {
      to: '/admin/roster',
      label: 'Course Catalog',
      icon: <Layers className="h-5 w-5" />,
    },
    {
      to: '/admin/audit-logs',
      label: 'Audit Trail',
      icon: <FileText className="h-5 w-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-concrete-100 dark:bg-concrete-950 text-concrete-900 dark:text-concrete-100 flex flex-col font-sans ambient-mesh selection:bg-safety selection:text-concrete-950">
      {/* Top Admin Executive Header */}
      <header className="sticky top-0 z-40 h-16 sm:h-20 bg-concrete-900 text-white border-b-2 border-safety/70 shadow-xl backdrop-blur-xl px-3.5 sm:px-8 flex items-center justify-between gap-2.5 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-concrete-800 text-concrete-300 hover:text-white md:hidden cursor-pointer shrink-0"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link to="/admin/dashboard" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
            <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-amber-500/20 border border-safety/60 text-safety shadow-safety/20 group-hover:scale-105 transition-transform shrink-0">
              <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-heading font-extrabold text-xs sm:text-base tracking-tight text-white truncate">
                  CIVIL ADMIN
                </span>
                <span className="font-mono text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 rounded bg-safety text-concrete-950 font-extrabold shrink-0">
                  HOD
                </span>
              </div>
              <p className="font-mono text-[9px] sm:text-[10px] text-concrete-400 truncate hidden xs:block">
                Civil Engineering Academic Administration
              </p>
            </div>
          </Link>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-concrete-800/80 hover:bg-concrete-700 text-xs font-mono text-concrete-200 border border-concrete-700 hover:border-blueprint-400 transition-all cursor-pointer shadow-xs"
          >
            <span>View Public Portal</span>
            <ExternalLink className="h-3.5 w-3.5 text-blueprint-400" />
          </Link>

          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-concrete-800 font-mono text-xs text-right">
            <div>
              <p className="text-white font-bold leading-tight">{user.name}</p>
              <p className="text-[10px] text-concrete-400 leading-tight">Staff ID: {user.rollNumber || 'FAC-CE-001'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 hover:text-white border border-rose-800/80 text-xs font-mono transition-all cursor-pointer shadow-xs"
            title="Sign out of Admin Session"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* Mobile Backdrop Overlay */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-concrete-950/70 backdrop-blur-sm md:hidden transition-opacity"
          />
        )}

        {/* Sidebar Navigation (Slide-out on mobile, static on desktop) */}
        <aside
          className={`fixed top-20 bottom-0 left-0 z-50 w-72 max-w-[85vw] bg-concrete-900 border-r border-concrete-800 flex flex-col p-4 transition-transform duration-200 md:static md:translate-x-0 md:w-64 md:z-auto ${
            isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="mb-4 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-concrete-500 font-bold flex items-center justify-between">
            <span>Administrative Management</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 rounded-lg text-concrete-400 hover:text-white md:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="space-y-1.5 flex-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-safety text-concrete-950 shadow-safety font-bold translate-x-1'
                      : 'text-concrete-300 hover:text-white hover:bg-concrete-800/80'
                  }`
                }
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Quick upload trigger shortcut */}
          <div className="pt-4 border-t border-concrete-800 space-y-2">
            <Link
              to="/admin/upload"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-blueprint-700 to-blueprint-800 hover:from-blueprint-600 hover:to-blueprint-700 text-white font-bold text-xs font-heading shadow-blueprint transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 text-safety" />
              <span>Upload New Asset</span>
            </Link>

            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-concrete-800 hover:bg-concrete-700 text-concrete-300 text-xs font-mono transition-all cursor-pointer"
            >
              <span>Back to Student View</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </aside>

        {/* Dynamic Workspace Content */}
        <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <FilePreviewModal />
      <ToastContainer />
    </div>
  );
};

