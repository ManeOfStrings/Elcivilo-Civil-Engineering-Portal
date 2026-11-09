import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Compass,
  Search,
  Sun,
  Moon,
  Lock,
  Menu,
  X,
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';

export const ElciviloNavbar: React.FC = () => {
  const { isDarkMode, toggleDarkMode, setIsSearchOpen } = usePortal();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Exactly the 8 required primary navigation sections from the specification
  const navSections = [
    { label: 'Syllabus', to: '/syllabus' },
    { label: 'Class Notes', to: '/notes' },
    { label: 'Question Papers', to: '/papers' },
    { label: 'Supply Special Notes', to: '/supply', highlight: true },
    { label: 'Notifications', to: '/notifications' },
    { label: 'Assignment', to: '/assignments' },
    { label: 'SGPA Calculator', to: '/sgpa' },
    { label: 'IS Codes & Reference Tables', to: '/is-codes' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-concrete-300 dark:border-concrete-800 bg-white/95 dark:bg-concrete-950/95 backdrop-blur-md transition-colors duration-200">
      {/* Top architectural drafting accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-blueprint-700 via-steel to-safety" />

      <div className="w-full max-w-7xl mx-auto pl-3 sm:pl-6 pr-6 sm:pr-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-3">
          {/* Left: Mobile Hamburger Toggle + Elcivilo Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile Hamburger Menu Toggle (Far Left, before Elcivilo Logo) */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded-xl border border-concrete-300 dark:border-concrete-700 text-concrete-700 dark:text-concrete-300 hover:bg-concrete-100 dark:hover:bg-concrete-800 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Elcivilo Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 sm:gap-2.5 shrink-0 group focus:outline-none"
              aria-label="Elcivilo Home"
            >
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blueprint-700 text-safety border border-blueprint-800 shadow-sm group-hover:scale-105 transition-transform shrink-0">
                <Compass className="w-4 h-4 sm:w-6 sm:h-6 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-concrete-900 dark:text-white leading-none">
                  Elcivilo
                </span>
                <span className="font-mono text-[9px] sm:text-[10px] text-concrete-500 uppercase tracking-wider font-semibold mt-0.5 hidden sm:block">
                  Civil Engineering Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop 8 Primary Navigation Sections */}
          <nav className="hidden xl:flex items-center gap-1">
            {navSections.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-blueprint-700 text-white shadow-xs'
                      : item.highlight
                      ? 'text-amber-700 dark:text-safety hover:bg-amber-50 dark:hover:bg-amber-950/40 font-bold'
                      : 'text-concrete-700 dark:text-concrete-300 hover:bg-concrete-100 dark:hover:bg-concrete-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Compact View for Lg Screens: Scrollable or Dropdown */}
          <nav className="hidden md:flex xl:hidden items-center gap-1 overflow-x-auto max-w-[55vw] py-1 text-xs">
            {navSections.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-blueprint-700 text-white'
                      : item.highlight
                      ? 'text-amber-700 dark:text-safety font-bold'
                      : 'text-concrete-700 dark:text-concrete-300 hover:bg-concrete-100 dark:hover:bg-concrete-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Icons: Search, Theme Toggle, Subtle Admin Login */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pr-4 sm:pr-0">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 sm:p-2 rounded-xl border border-concrete-300 dark:border-concrete-700 hover:bg-concrete-100 dark:hover:bg-concrete-800 text-concrete-600 dark:text-concrete-300 transition-colors cursor-pointer"
              title="Search Portal (Ctrl+K)"
              aria-label="Search resources"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 sm:p-2 rounded-xl border border-concrete-300 dark:border-concrete-700 hover:bg-concrete-100 dark:hover:bg-concrete-800 text-concrete-600 dark:text-concrete-300 transition-colors cursor-pointer"
              title={isDarkMode ? 'Light Mode' : 'Dark Blueprint Mode'}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-safety" /> : <Moon className="w-4 h-4 text-blueprint-700" />}
            </button>

            {/* Subtle Admin Login Icon */}
            <Link
              to="/admin/login"
              className="p-1.5 sm:p-2 rounded-xl border border-concrete-300 dark:border-concrete-700 hover:border-blueprint-500 hover:text-blueprint-600 text-concrete-400 dark:text-concrete-500 transition-colors mr-1 sm:mr-0"
              title="Admin Access"
              aria-label="Admin Login"
            >
              <Lock className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileOpen && (
        <div className="md:hidden border-t border-concrete-200 dark:border-concrete-800 bg-white dark:bg-concrete-950 p-4 space-y-1.5 animate-in slide-in-from-top-2">
          {navSections.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-blueprint-700 text-white font-bold'
                    : item.highlight
                    ? 'text-amber-800 dark:text-safety bg-amber-50/50 dark:bg-amber-950/20 font-bold'
                    : 'text-concrete-800 dark:text-concrete-200 hover:bg-concrete-100 dark:hover:bg-concrete-900'
                }`
              }
            >
              <span>{item.label}</span>
              <span className="text-concrete-400">→</span>
            </NavLink>
          ))}

          <div className="pt-2 border-t border-concrete-100 dark:border-concrete-800 flex items-center justify-between">
            <Link
              to="/admin/login"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-2 text-xs font-mono text-concrete-500 hover:text-blueprint-600 py-1"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Portal Login</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
