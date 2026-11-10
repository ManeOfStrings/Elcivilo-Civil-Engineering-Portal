import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Database,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Button } from '../common/Button';

export const AdminLogin: React.FC = () => {
  const { loginAsAdmin, registerAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath = (location.state as any)?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    if (mode === 'register') {
      const res = await registerAdmin(email.trim(), password, name.trim());
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMsg('Account created successfully! Logging you into Admin Portal...');
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 1200);
      } else {
        setErrorMsg(res.error || 'Failed to register admin account.');
      }
    } else {
      const res = await loginAsAdmin(email.trim(), password);
      setIsSubmitting(false);

      if (res.success) {
        navigate(redirectPath, { replace: true });
      } else {
        setErrorMsg(res.error || 'Failed to authenticate. Please verify your credentials.');
      }
    }
  };

  const handleQuickDemo = () => {
    setMode('login');
    setEmail('admin@civilportal.edu');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-concrete-950 text-concrete-100 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden font-sans ambient-mesh selection:bg-safety selection:text-concrete-950">
      {/* Background Architectural Grid */}
      <div className="absolute inset-0 bg-blueprint-grid opacity-20 pointer-events-none" />

      {/* Top Bar */}
      <div className="relative z-10 max-w-7xl w-full mx-auto flex items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-2xl bg-concrete-900/80 border border-concrete-800 text-xs font-mono text-concrete-300 hover:text-white hover:border-blueprint-500 transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Return to Public Student Portal</span>
          <span className="sm:hidden">Student Portal</span>
        </Link>

        <div className="flex items-center gap-2 font-mono text-xs text-concrete-400 shrink-0">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="hidden sm:inline">GATEWAY: SECURE ACCESS</span>
          <span className="sm:hidden">SECURE</span>
        </div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 max-w-md w-full mx-auto my-6 sm:my-8">
        <div className="bg-concrete-900/90 backdrop-blur-2xl border border-concrete-800/90 rounded-3xl p-6 sm:p-8 sm:p-10 shadow-2xl space-y-5 sm:space-y-6 relative overflow-hidden">
          {/* Luminous Glow Accent */}
          <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-safety/10 blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="space-y-2 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 border border-safety/60 text-safety shadow-safety/20 mb-1">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-safety/20 border border-safety/40 text-[10px] font-mono font-extrabold text-safety uppercase tracking-wider">
              Faculty & HOD Authentication
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Admin Control Center
            </h1>
            <p className="text-xs sm:text-sm text-concrete-400 leading-relaxed font-sans">
              Sign in to manage curriculum documents, upload syllabi, publish circulars, and moderate assignments.
            </p>
          </div>

          {/* Database mode pill */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-concrete-950/70 border border-concrete-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blueprint-400" />
              <span className="text-concrete-300">Auth Engine:</span>
            </div>
            <span
              className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                isSupabaseConfigured
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-safety border border-amber-800'
              }`}
            >
              {isSupabaseConfigured ? 'Supabase RLS Active' : 'Standalone / Demo Mode'}
            </span>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex rounded-2xl bg-concrete-950/70 p-1 border border-concrete-800 text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                mode === 'login'
                  ? 'bg-safety text-concrete-950 shadow-sm'
                  : 'text-concrete-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                mode === 'register'
                  ? 'bg-safety text-concrete-950 shadow-sm'
                  : 'text-concrete-400 hover:text-white'
              }`}
            >
              Register Admin
            </button>
          </div>

          {/* Success Message */}
          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-mono flex items-start gap-2.5 animate-in fade-in">
              <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-mono flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-concrete-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-blueprint-400" />
                  Full Name & Designation
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Doom (HOD Civil)"
                  className="w-full px-4 py-3 rounded-2xl border border-concrete-700 bg-concrete-800/80 text-white placeholder-concrete-500 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-safety focus:border-safety transition-all shadow-inner"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-concrete-300 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-blueprint-400" />
                Faculty Email ID
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="faculty.head@civilportal.edu"
                className="w-full px-4 py-3 rounded-2xl border border-concrete-700 bg-concrete-800/80 text-white placeholder-concrete-500 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-safety focus:border-safety transition-all shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-concrete-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-blueprint-400" />
                Security Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-2xl border border-concrete-700 bg-concrete-800/80 text-white placeholder-concrete-500 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-safety focus:border-safety transition-all shadow-inner"
              />
            </div>

            <Button
              type="submit"
              variant="safety"
              size="lg"
              className="w-full mt-2 font-bold cursor-pointer"
              disabled={isSubmitting}
              icon={<ArrowRight className="h-5 w-5" />}
            >
              {isSubmitting
                ? mode === 'register'
                  ? 'Registering Supabase Admin...'
                  : 'Authenticating Admin...'
                : mode === 'register'
                ? 'Create Supabase Admin Account'
                : 'Authenticate & Enter Dashboard'}
            </Button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="pt-4 border-t border-concrete-800 text-center space-y-2.5">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2.5 px-4 rounded-xl border border-concrete-700 bg-concrete-800/50 hover:bg-concrete-800 text-xs font-mono text-safety flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-safety" />
              <span>Fill Demo Credentials (admin@civilportal.edu)</span>
            </button>
            <p className="text-[11px] font-mono text-concrete-500">
              Only authorized departmental administrators and faculty heads have access.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 max-w-7xl w-full mx-auto text-center text-xs font-mono text-concrete-500">
        <span>Civil Engineering Academic Management System • Security Guard v2.6</span>
      </div>
    </div>
  );
};

