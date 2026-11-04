import React, { useState, useEffect, Suspense, lazy } from 'react';
import StorePage from './pages/StorePage';
import CatalogPage from './pages/CatalogPage';
import ProductPage from './pages/ProductPage';
import CompareFloatingBar from './components/store/CompareFloatingBar';
import { useStore } from './context/StoreContext';
import { initSpaNavigation, parsePath } from './utils/navigation';

// მეორადი და ადმინ გვერდების lazy ჩატვირთვა (Code Splitting)
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const SizeGuidePage = lazy(() => import('./pages/SizeGuidePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const CompareModal = lazy(() => import('./components/modals/CompareModal'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AddProductPage = lazy(() => import('./pages/AddProductPage'));
const MyItemsPage = lazy(() => import('./pages/MyItemsPage'));

// მსუბუქი ჩამტვირთავი ეკრანი გვერდებს შორის გადასვლისას
const PageLoader = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  const { showCompareModal, lang, setLang } = useStore();
  const [currentInfo, setCurrentInfo] = useState(() => parsePath(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => {
      const parsed = parsePath(window.location.pathname);
      setCurrentInfo(parsed);
      if (parsed.lang !== lang) {
        setLang(parsed.lang);
      }
    };
    window.addEventListener("popstate", handlePopState);
    const cleanupSpa = initSpaNavigation();

    // საწყისი შემოწმება: თუ URL შეიცავს /en-ს, ენის state-იც სინქრონიზდეს
    const initial = parsePath(window.location.pathname);
    if (initial.lang !== lang) {
      setLang(initial.lang);
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
      cleanupSpa();
    };
  }, [lang, setLang]);

  const route = currentInfo.route;

  if (route === "/admin") {
    return (
      <Suspense fallback={<PageLoader />}>
        <AdminPage />
      </Suspense>
    );
  }

  let content;

  if (route === "" || route === "/") {
    content = <StorePage />;
  } else if (route === "/about") {
    content = (
      <Suspense fallback={<PageLoader />}>
        <AboutPage />
      </Suspense>
    );
  } else if (route === "/blog") {
    content = (
      <Suspense fallback={<PageLoader />}>
        <BlogPage />
      </Suspense>
    );
  } else if (route.startsWith("/blog/")) {
    content = (
      <Suspense fallback={<PageLoader />}>
        <BlogPostPage />
      </Suspense>
    );
  } else if (route === "/catalog" || route === "/collection") {
    content = <CatalogPage />;
  } else if (route === "/size-guide" || route === "/sizes" || route === "/ring-size") {
    content = (
      <Suspense fallback={<PageLoader />}>
        <SizeGuidePage />
      </Suspense>
    );
  } else if (route === "/product" || route.startsWith("/product/") || route.startsWith("/product?")) {
    content = <ProductPage key={window.location.pathname} />;
  } else if (route === "/login") {
    content = (
      <Suspense fallback={<PageLoader />}>
        <LoginPage initialMode="login" />
      </Suspense>
    );
  } else if (route === "/forgot-password") {
    content = (
      <Suspense fallback={<PageLoader />}>
        <LoginPage initialMode="forgot" />
      </Suspense>
    );
  } else if (route === "/reset-password" || route === "/__/auth/action") {
    content = (
      <Suspense fallback={<PageLoader />}>
        <LoginPage initialMode="new-password" />
      </Suspense>
    );
  } else if (route === "/register") {
    content = (
      <Suspense fallback={<PageLoader />}>
        <RegisterPage />
      </Suspense>
    );
  } else if (route === "/add" || route === "/my-items" || route === "/my-products") {
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
