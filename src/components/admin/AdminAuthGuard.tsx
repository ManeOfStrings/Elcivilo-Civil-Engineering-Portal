import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HardHat } from 'lucide-react';

export const AdminAuthGuard: React.FC = () => {
  const { isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-concrete-950 text-white flex flex-col items-center justify-center p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-safety/20 border border-safety/50 text-safety animate-pulse mb-4">
          <HardHat className="h-7 w-7" />
        </div>
        <p className="font-mono text-xs uppercase tracking-widest text-concrete-400">
          Verifying Admin Credentials...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

