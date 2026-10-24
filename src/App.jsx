import React, { useState, useEffect, Suspense, lazy } from 'react';
import StorePage from './pages/StorePage';

// ეს გვერდები მთავარ გვერდზე შესვლისას აღარ დაამძიმებს საიტს (Code Splitting)
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));

// მსუბუქი ჩამტვირთავი ეკრანი გვერდებს შორის გადასვლისას
const PageLoader = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

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

  if (currentPath === "/admin") {
    return (
      <Suspense fallback={<PageLoader />}>
        <AdminPage />
      </Suspense>
    );
  }

  if (currentPath === "/about") {
    return (
      <Suspense fallback={<PageLoader />}>
        <AboutPage />
      </Suspense>
    );
  }

  if (currentPath === "/blog") {
    return (
      <Suspense fallback={<PageLoader />}>
        <BlogPage />
      </Suspense>
    );
  }

  if (currentPath.startsWith("/blog/")) {
    return (
      <Suspense fallback={<PageLoader />}>
        <BlogPostPage />
      </Suspense>
    );
  }

  if (currentPath === "/catalog" || currentPath === "/collection") {
    return (
      <Suspense fallback={<PageLoader />}>
        <CatalogPage />
      </Suspense>
    );
  }

  if (currentPath.startsWith("/product")) {
    return (
      <Suspense fallback={<PageLoader />}>
        <ProductPage />
      </Suspense>
    );
  }

  return <StorePage />;
}
