import React, { useState, useEffect, Suspense, lazy } from 'react';
import StorePage from './pages/StorePage';
import CompareFloatingBar from './components/store/CompareFloatingBar';
import { useStore } from './context/StoreContext';
import { initSpaNavigation, parsePath } from './utils/navigation';

// მეორადი და შიდა გვერდების lazy ჩატვირთვა (Zero Unused JS on Home Page)
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const SizeGuidePage = lazy(() => import('./pages/SizeGuidePage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const CompareModal = lazy(() => import('./components/modals/CompareModal'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));
const AddProductPage = lazy(() => import('./pages/AddProductPage'));
const MyItemsPage = lazy(() => import('./pages/MyItemsPage'));

// მსუბუქი ჩამტვირთავი ეკრანი გვერდებს შორის გადასვლისას
const PageLoader = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="w-7 h-7 border-[1.5px] border-[#9D7B48] border-t-transparent rounded-full animate-spin"></div>
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
  } else if (route === "/faq") {
    content = (
      <Suspense fallback={<PageLoader />}>
        <FaqPage />
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
  } else if (route === "/profile") {
    content = (
      <Suspense fallback={<PageLoader />}>
        <ProfilePage />
      </Suspense>
    );
  } else if (route === "/checkout" || route === "/buy") {
    content = (
      <Suspense fallback={<PageLoader />}>
        <CheckoutPage />
      </Suspense>
    );
  } else if (route === "/track" || route === "/tracking" || route.startsWith("/track?")) {
    content = (
      <Suspense fallback={<PageLoader />}>
        <OrderTrackingPage />
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
