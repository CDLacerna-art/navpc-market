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
import SellerDashboardPlaceholder from '../pages/seller/SellerDashboardPlaceholder';
import AdminDashboardPlaceholder from '../pages/admin/AdminDashboardPlaceholder';
import { RequireAuth, RequireRole } from '../components/auth/RouteGuards';

export default function AppRoutes() {
  return (
    <Routes>
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

        {/* Protected Seller Routes (Requires Seller or Admin role) */}
        <Route
          path="seller/dashboard"
          element={
            <RequireRole allowedRoles={['seller', 'admin']} roleTitle="Student Sellers">
              <SellerDashboardPlaceholder />
            </RequireRole>
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
    </Routes>
  );
}
