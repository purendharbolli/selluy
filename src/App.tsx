import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LocationProvider } from './context/LocationContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { DemoRoleBanner } from './components/common/DemoRoleBanner';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { MobileBottomNav } from './components/common/MobileBottomNav';

// Pages
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { ProductDetails } from './pages/ProductDetails';
import { SellerProfilePage } from './pages/SellerProfilePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { WishlistPage } from './pages/WishlistPage';
import { SellerOnboardingPage } from './pages/SellerOnboardingPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { PoliciesPage } from './pages/PoliciesPage';

// Scroll to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export function App() {
  return (
    <BrowserRouter>
      <LocationProvider>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-stone-900 selection:bg-brand-100 selection:text-brand-900">
              <ScrollToTop />
              <DemoRoleBanner />
              <Navbar />

              <main className="flex-1 pb-16 md:pb-0">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/seller/:id" element={<SellerProfilePage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/seller/onboarding" element={<SellerOnboardingPage />} />
                  <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/policies/:type" element={<PoliciesPage />} />
                  {/* Catch-all fallback */}
                  <Route path="*" element={<Home />} />
                </Routes>
              </main>

              <Footer />
              <MobileBottomNav />
            </div>
          </CartProvider>
        </AuthProvider>
      </LocationProvider>
    </BrowserRouter>
  );
}

export default App;
