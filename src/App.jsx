import React, { useState, useEffect } from 'react';
import StorePage from './pages/StorePage';
import AdminPage from './pages/AdminPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState(() =>
    window.location.pathname.replace(/\/+$/, "") || "/"
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname.replace(/\/+$/, "") || "/");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  if (currentPath === "/admin") return <AdminPage />;
  if (currentPath === "/about") return <AboutPage />;

  return <StorePage />;
}