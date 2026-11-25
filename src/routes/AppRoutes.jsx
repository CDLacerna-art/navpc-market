import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import HomePage from '../pages/public/HomePage';
import AboutPage from '../pages/public/AboutPage';
import MarketplacePage from '../pages/public/MarketplacePage';
import ProductDetailPage from '../pages/public/ProductDetailPage';
import CartPage from '../pages/public/CartPage';
import CheckoutPage from '../pages/public/CheckoutPage';
import OrderConfirmationPage from '../pages/public/OrderConfirmationPage';
import NotFoundPage from '../pages/public/NotFoundPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import BuyerDashboardPlaceholder from '../pages/buyer/BuyerDashboardPlaceholder';
import AdminDashboardPlaceholder from '../pages/admin/AdminDashboardPlaceholder';
import { RequireAuth, RequireRole } from '../components/auth/RouteGuards';

// Seller Dashboard Pages & Layout
import SellerLayout from '../layouts/SellerLayout';
import SellerOverviewPage from '../pages/seller/SellerOverviewPage';
import SellerProductsPage from '../pages/seller/SellerProductsPage';
import SellerAddProductPage from '../pages/seller/SellerAddProductPage';
import SellerEditProductPage from '../pages/seller/SellerEditProductPage';
import SellerInventoryPage from '../pages/seller/SellerInventoryPage';
import SellerOrdersPage from '../pages/seller/SellerOrdersPage';
import SellerAnalyticsPage from '../pages/seller/SellerAnalyticsPage';
import SellerStoreSettingsPage from '../pages/seller/SellerStoreSettingsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages with Standard PublicLayout (Navbar, Banner, Footer) */}
      <Route path="/" element={<PublicLayout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="product/:productId" element={<ProductDetailPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} />

        {/* Auth Routes */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Protected Buyer Routes (Requires Authentication) */}
        <Route
          path="buyer/dashboard"
          element={
            <RequireAuth>
              <BuyerDashboardPlaceholder title="Buyer Dashboard" phase="Phase 7" />
            </RequireAuth>
          }
        />
        <Route
          path="buyer/orders"
          element={
            <RequireAuth>
              <BuyerDashboardPlaceholder title="My Campus Orders" phase="Phase 7" />
            </RequireAuth>
          }
        />
        <Route
          path="buyer/wishlist"
          element={
            <RequireAuth>
              <BuyerDashboardPlaceholder title="Saved Wishlist" phase="Phase 7" />
            </RequireAuth>
          }
        />

        {/* Protected Admin Routes (Requires Admin role only) */}
        <Route
          path="admin/dashboard"
          element={
            <RequireRole allowedRoles={['admin']} roleTitle="Platform Administrators">
              <AdminDashboardPlaceholder />
            </RequireRole>
          }
        />

        {/* Fallback 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Protected Seller Routes (Standalone Dedicated Seller Layout) */}
      <Route
        path="seller"
        element={
          <RequireRole allowedRoles={['seller', 'admin']} roleTitle="Student Sellers">
            <SellerLayout />
          </RequireRole>
        }
      >
        <Route index element={<SellerOverviewPage />} />
        <Route path="dashboard" element={<SellerOverviewPage />} />
        <Route path="products" element={<SellerProductsPage />} />
        <Route path="products/new" element={<SellerAddProductPage />} />
        <Route path="products/edit/:id" element={<SellerEditProductPage />} />
        <Route path="inventory" element={<SellerInventoryPage />} />
        <Route path="orders" element={<SellerOrdersPage />} />
        <Route path="analytics" element={<SellerAnalyticsPage />} />
        <Route path="settings" element={<SellerStoreSettingsPage />} />
      </Route>
    </Routes>
  );
}
