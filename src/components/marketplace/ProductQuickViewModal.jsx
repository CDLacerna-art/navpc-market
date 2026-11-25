import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import Button from '../common/Button';
import InitialsAvatar from '../common/InitialsAvatar';
import CategoryPlaceholder from './CategoryPlaceholder';
import { formatPHP } from '../../utils/currency';
import { useCart } from '../../context/CartContext';
import {
  X,
  ShoppingCart,
  Star,
  MapPin,
  ShieldCheck,
  Store,
  Clock,
  Plus,
  Minus,
  Ban
} from 'lucide-react';

export default function ProductQuickViewModal({
  product,
  onClose,
}) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const [imgError, setImgError] = useState(false);
  const isOutOfStock = product.stock === 0;
  const isDigital = product.condition === 'Digital / Service';

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
    >
      {/* Backdrop overlay */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-surface-border w-full max-w-3xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Top Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-content-muted hover:text-content-heading bg-white/90 hover:bg-white rounded-full shadow-sm border border-surface-border transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Image and Badges */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-surface-border">
              {imgError ? (
                <CategoryPlaceholder
                  categorySlug={product.categorySlug}
                  categoryName={product.category}
                />
              ) : (
                <img
                  src={product.image}
                  alt={product.title}
                  onError={() => setImgError(true)}
                  className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale opacity-75' : ''}`}
                />
              )}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <Badge variant="primary" size="md">
                  {product.condition}
                </Badge>
                {isOutOfStock ? (
                  <Badge variant="danger" size="md" dot>
                    Out of Stock
                  </Badge>
                ) : product.stock <= 2 && !isDigital ? (
                  <Badge variant="warning" size="md" dot>
                    Only {product.stock} items left
                  </Badge>
                ) : null}
              </div>
            </div>

            {/* Meetup guarantee card */}
            <div className="p-3 bg-surface-bg border border-surface-border rounded-xl text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-brand-blue font-semibold">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Proposed Campus Meetup Spot</span>
              </div>
              <p className="text-content-body font-medium">
                {product.meetupLocation}
              </p>
              <p className="text-[11px] text-content-muted">
                Proposed peer-to-peer exchange location subject to official NPC school approval.
              </p>
            </div>
          </div>

          {/* Right Column: Details & Order CTA */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-brand-blue uppercase tracking-wider">
                  {product.category}
                </span>
                <div className="flex items-center gap-1 text-amber-600 font-semibold" title="Sample demonstration rating">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating.toFixed(1)}</span>
                  <span className="text-content-subtle font-normal">({product.reviewsCount} sample reviews)</span>
                </div>
              </div>

              {/* Title */}
              <h2 id="quick-view-title" className="text-lg sm:text-xl font-bold text-content-heading leading-snug">
                {product.title}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-2 pb-2 border-b border-surface-border">
                <span className="text-2xl font-extrabold text-content-heading">
                  {formatPHP(product.price)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-sm text-content-subtle line-through">
                      {formatPHP(product.originalPrice)}
                    </span>
                    <Badge variant="success" size="sm">
                      Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% (Sample Promo)
                    </Badge>
                  </>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-content-heading">
                  Product Details
                </h4>
                <p className="text-xs text-content-body leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Seller Profile Card */}
              <div className="p-3 bg-blue-50/60 border border-blue-200/70 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-brand-dark uppercase tracking-wider flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-brand-blue" />
                    Demo Seller
                  </span>
                  <span className="text-content-muted">Sample ID: {product.seller.studentId}</span>
                </div>

                <div className="flex items-center gap-3">
                  <InitialsAvatar
                    name={product.seller.name}
                    size="md"
                    className="ring-2 ring-white"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-content-heading">{product.seller.name}</h5>
                    <p className="text-[11px] text-content-muted">{product.seller.program}</p>
                    <p className="text-[10px] text-content-subtle font-medium">
                      ★ {product.seller.rating} sample rating • {product.seller.salesCount} sample campus orders (Demonstration Record)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions: Quantity Stepper & Add to Cart */}
            <div className="space-y-3 pt-3 border-t border-surface-border">
              {!isDigital && !isOutOfStock && (
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-content-heading">Quantity:</span>
                  <div className="inline-flex items-center rounded-lg border border-surface-border bg-surface-bg p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="p-1 rounded text-content-muted hover:text-content-heading hover:bg-white disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-bold text-content-heading">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                      className="p-1 rounded text-content-muted hover:text-content-heading hover:bg-white disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Button
                  variant={isOutOfStock ? 'secondary' : 'primary'}
                  size="lg"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  leftIcon={isOutOfStock ? Ban : ShoppingCart}
                  className="flex-1"
                >
                  {isOutOfStock ? 'Sold Out' : `Add to Cart • ${formatPHP(product.price * quantity)}`}
                </Button>
                <div className="flex items-center gap-2">
                  <Link to={`/product/${product.id}`} onClick={onClose} className="flex-1 sm:flex-initial">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full text-xs"
                    >
                      Full Details
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={onClose}
                    className="flex-1 sm:flex-initial"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
