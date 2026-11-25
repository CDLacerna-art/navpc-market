import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPHP } from '../../utils/currency';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Store,
  ShieldCheck,
  MapPin,
  Info,
  RotateCcw
} from 'lucide-react';

export default function CartPage() {
  const { cartItems, totalItems, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* =========================================================================
          BREADCRUMBS & HEADER
         ========================================================================= */}
      <div className="space-y-2 border-b border-surface-border pb-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-content-muted">
          <Link to="/" className="hover:text-brand-blue transition-colors">
            Home
          </Link>
          <span className="text-content-subtle">/</span>
          <span className="font-semibold text-content-heading">Shopping Cart</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary" size="sm" dot>
                Campus Cart
              </Badge>
              <span className="text-xs text-content-muted">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} in cart
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-content-heading tracking-tight">
              Campus Shopping Cart
            </h1>
            <p className="text-xs sm:text-sm text-content-muted mt-1">
              Review your items and quantities before arranging proposed campus meetup fulfillment.
            </p>
          </div>

          {cartItems.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={clearCart}
              leftIcon={RotateCcw}
              className="text-xs text-content-muted hover:text-status-danger hover:border-red-200"
            >
              Clear Cart
            </Button>
          )}
        </div>
      </div>

      {/* =========================================================================
          CART CONTENT OR EMPTY STATE
         ========================================================================= */}
      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-surface-border rounded-2xl divide-y divide-surface-border shadow-xs overflow-hidden">
              {cartItems.map((item) => {
                const { product, quantity } = item;
                const isMaxStock = quantity >= product.stock;
                const itemSubtotal = product.price * quantity;

                return (
                  <div key={product.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    {/* Item Thumbnail & Basic Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Link
                        to={`/product/${product.id}`}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 border border-surface-border shrink-0 hover:opacity-90 transition-opacity"
                      >
                        <img
                          src={product.image}
                          alt={product.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/images/products/scientific-calculator.jpg';
                          }}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold text-brand-blue uppercase tracking-wider">
                            {product.category}
                          </span>
                          <span className="text-content-subtle">•</span>
                          <span className="text-[10px] text-content-muted font-medium">
                            {product.condition}
                          </span>
                        </div>

                        <Link
                          to={`/product/${product.id}`}
                          className="text-sm font-bold text-content-heading hover:text-brand-blue transition-colors line-clamp-1 leading-snug"
                          title={product.title}
                        >
                          {product.title}
                        </Link>

                        <p className="text-[11px] text-content-muted truncate">
                          Seller: <span className="font-medium text-content-heading">{product.seller.name}</span> <span className="text-[10px] text-brand-blue">(Demo Seller)</span>
                        </p>

                        <p className="text-xs font-semibold text-content-heading sm:hidden pt-1">
                          {formatPHP(product.price)} each
                        </p>
                      </div>
                    </div>

                    {/* Unit Price (Desktop only) */}
                    <div className="hidden sm:block text-right pr-4 shrink-0">
                      <p className="text-xs text-content-muted">Unit Price</p>
                      <p className="text-sm font-bold text-content-heading">
                        {formatPHP(product.price)}
                      </p>
                    </div>

                    {/* Quantity Controls & Remove */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-surface-border">
                      <div className="flex flex-col items-start sm:items-center">
                        <div className="inline-flex items-center rounded-xl border border-surface-border bg-surface-bg p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            disabled={quantity <= 1}
                            className="p-1.5 rounded-lg text-content-muted hover:text-content-heading hover:bg-white disabled:opacity-30 transition-colors"
                            aria-label={`Decrease quantity for ${product.title}`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-9 text-center font-bold text-xs text-content-heading">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            disabled={isMaxStock}
                            className="p-1.5 rounded-lg text-content-muted hover:text-content-heading hover:bg-white disabled:opacity-30 transition-colors"
                            aria-label={`Increase quantity for ${product.title}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {isMaxStock && (
                          <span className="text-[10px] text-amber-600 font-medium mt-0.5">
                            Max stock ({product.stock})
                          </span>
                        )}
                      </div>

                      {/* Subtotal */}
                      <div className="text-right min-w-[80px]">
                        <p className="text-[11px] text-content-muted sm:hidden">Total</p>
                        <p className="text-sm font-extrabold text-content-heading">
                          {formatPHP(itemSubtotal)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(product.id)}
                        className="p-2 text-content-subtle hover:text-status-danger hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove item from cart"
                        aria-label={`Remove ${product.title} from cart`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Back to Shopping Action */}
            <div className="pt-2">
              <Link to="/marketplace">
                <Button variant="secondary" size="sm" leftIcon={ArrowLeft}>
                  Continue Browsing Marketplace
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout CTA (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-surface-border rounded-2xl p-6 space-y-5 shadow-xs sticky top-20">
              <h3 className="text-sm font-bold uppercase tracking-wider text-content-heading pb-3 border-b border-surface-border">
                Demonstration Order Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-content-body">
                  <span>Items Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                  <span className="font-semibold text-content-heading">{formatPHP(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-content-body">
                  <span>Campus Platform Fee</span>
                  <span className="font-semibold text-status-success">₱0.00 (Proposed Demo Platform Fee)</span>
                </div>

                <div className="flex items-center justify-between text-content-body">
                  <span>Proposed Campus Meetup</span>
                  <span className="font-semibold text-status-success">₱0.00 (Proposed Free Handover)</span>
                </div>

                <div className="pt-3 border-t border-surface-border flex items-baseline justify-between">
                  <span className="text-sm font-bold text-content-heading">Estimated Total</span>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-content-heading">
                      {formatPHP(subtotal)}
                    </span>
                    <p className="text-[10px] text-content-muted">Philippine Pesos (PHP)</p>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleCheckoutClick}
                  rightIcon={ArrowRight}
                  className="w-full shadow-md"
                >
                  Proceed to Checkout
                </Button>
              </div>

              {/* Campus Meetup Reminder */}
              <div className="p-3 bg-surface-bg border border-surface-border rounded-xl text-[11px] text-content-muted space-y-1">
                <div className="flex items-center gap-1.5 text-brand-blue font-semibold">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>Proposed Campus Meetup</span>
                </div>
                <p className="leading-snug">
                  Orders are fulfilled peer-to-peer at proposed campus meetup spots (subject to school approval). Pay in cash or via GCash directly upon meetup.
                </p>
              </div>

              {/* Academic Disclaimer */}
              <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[10px] text-amber-900 leading-tight">
                <strong>Academic Prototype Notice:</strong> No real payment, delivery, or financial transaction will be conducted.
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-surface-border rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-content-heading">Your Campus Cart is Empty</h2>
            <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
              You haven't added any campus textbooks, snacks, supplies, or digital services yet.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/marketplace">
              <Button variant="primary" size="md" rightIcon={ArrowRight}>
                Explore Marketplace
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
