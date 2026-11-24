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
import BuyerDashboardPlaceholder from '../pages/buyer/BuyerDashboardPlaceholder';
import SellerDashboardPlaceholder from '../pages/seller/SellerDashboardPlaceholder';
import AdminDashboardPlaceholder from '../pages/admin/AdminDashboardPlaceholder';

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

        {/* Buyer Routes */}
        <Route path="buyer/dashboard" element={<BuyerDashboardPlaceholder title="Buyer Dashboard" phase="Phase 7" />} />
        <Route path="buyer/orders" element={<BuyerDashboardPlaceholder title="My Campus Orders" phase="Phase 7" />} />
        <Route path="buyer/wishlist" element={<BuyerDashboardPlaceholder title="Saved Wishlist" phase="Phase 7" />} />

        {/* Seller Routes */}
        <Route path="seller/dashboard" element={<SellerDashboardPlaceholder />} />

        {/* Admin Routes */}
        <Route path="admin/dashboard" element={<AdminDashboardPlaceholder />} />

        {/* Fallback 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
