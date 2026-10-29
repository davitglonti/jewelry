// src/components/auth/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = window.location.pathname;
      const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
      window.location.replace(redirectUrl);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0b0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-amber-500/80 tracking-widest uppercase font-mono">ავტორიზაციის შემოწმება...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return children;
}
