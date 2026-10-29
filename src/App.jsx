import React, { useState, useEffect, Suspense, lazy } from 'react';
import StorePage from './pages/StorePage';
import CompareFloatingBar from './components/store/CompareFloatingBar';
import { useStore } from './context/StoreContext';

// ეს გვერდები მთავარ გვერდზე შესვლისას აღარ დაამძიმებს საიტს (Code Splitting)
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const SizeGuidePage = lazy(() => import('./pages/SizeGuidePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const CompareModal = lazy(() => import('./components/modals/CompareModal'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AddProductPage = lazy(() => import('./pages/AddProductPage'));
const MyItemsPage = lazy(() => import('./pages/MyItemsPage'));
import ProtectedRoute from './components/auth/ProtectedRoute';

// მსუბუქი ჩამტვირთავი ეკრანი გვერდებს შორის გადასვლისას
const PageLoader = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  const { showCompareModal } = useStore();
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

  let content;

  if (currentPath === "" || currentPath === "/") {
    content = <StorePage />;
  } else if (currentPath === "/about") {
    content = (
      <Suspense fallback={<PageLoader />}>
        <AboutPage />
      </Suspense>
    );
  } else if (currentPath === "/blog") {
    content = (
      <Suspense fallback={<PageLoader />}>
        <BlogPage />
      </Suspense>
    );
  } else if (currentPath.startsWith("/blog/")) {
    content = (
      <Suspense fallback={<PageLoader />}>
        <BlogPostPage />
      </Suspense>
    );
  } else if (currentPath === "/catalog" || currentPath === "/collection") {
    content = (
      <Suspense fallback={<PageLoader />}>
        <CatalogPage />
      </Suspense>
    );
  } else if (currentPath === "/size-guide" || currentPath === "/sizes" || currentPath === "/ring-size") {
    content = (
      <Suspense fallback={<PageLoader />}>
        <SizeGuidePage />
      </Suspense>
    );
  } else if (currentPath === "/product" || currentPath.startsWith("/product/") || currentPath.startsWith("/product?")) {
    content = (
      <Suspense fallback={<PageLoader />}>
        <ProductPage />
      </Suspense>
    );
  } else if (currentPath === "/login") {
    content = (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    );
  } else if (currentPath === "/register") {
    content = (
      <Suspense fallback={<PageLoader />}>
        <RegisterPage />
      </Suspense>
    );
  } else if (currentPath === "/add" || currentPath === "/my-items" || currentPath === "/my-products") {
    // ნივთების მართვა და დამატება მხოლოდ ადმინ პანელშია
    window.location.replace("/admin");
    return null;
  } else {
    // 404: ნებისმიერი არარსებული გვერდი (მაგ: /dadsad)
    content = (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    );
  }

  return (
    <>
      {content}
      <CompareFloatingBar />
      {showCompareModal && (
        <Suspense fallback={null}>
          <CompareModal />
        </Suspense>
      )}
    </>
  );
}
