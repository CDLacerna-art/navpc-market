import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ALL_PRODUCTS, DEMO_CATEGORIES } from '../../utils/demoData';
import { formatPHP } from '../../utils/currency';
import { useCart } from '../../context/CartContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import InitialsAvatar from '../../components/common/InitialsAvatar';
import ProductCard from '../../components/marketplace/ProductCard';
import ProductQuickViewModal from '../../components/marketplace/ProductQuickViewModal';
import {
  ChevronRight,
  ArrowLeft,
  ShoppingCart,
  Star,
  MapPin,
  ShieldCheck,
  Store,
  Clock,
  Plus,
  Minus,
  Ban,
  PackageX,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Scroll to top when product ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setQuantity(1);
  }, [productId]);

  // Find product from demo catalog
  const product = ALL_PRODUCTS.find((p) => p.id === productId);

  // If product not found
  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-status-warning flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-content-heading">Product Not Found</h1>
        <p className="text-xs sm:text-sm text-content-muted max-w-md mx-auto">
          The requested campus item with ID <code className="bg-gray-100 px-1.5 py-0.5 rounded text-content-heading">{productId}</code> does not exist or has been removed from the demonstration catalog.
        </p>
        <div className="pt-2">
          <Link to="/marketplace">
            <Button variant="primary" leftIcon={ArrowLeft}>
              Return to Marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 2;
  const isDigital = product.condition === 'Digital / Service';

  const conditionVariant =
    product.condition === 'Brand New'
      ? 'success'
      : product.condition === 'Like New'
      ? 'primary'
      : product.condition === 'Digital / Service'
      ? 'info'
      : 'warning';

  // Related products from the same category
  const relatedProducts = ALL_PRODUCTS.filter(
    (p) => p.categorySlug === product.categorySlug && p.id !== product.id
  ).slice(0, 3);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* =========================================================================
          BREADCRUMBS & NAVIGATION
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-surface-border">
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1.5 text-xs text-content-muted">
          <Link to="/" className="hover:text-brand-blue transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-content-subtle" />
          <Link to="/marketplace" className="hover:text-brand-blue transition-colors">
            Marketplace
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-content-subtle" />
          <Link
            to={`/marketplace?category=${product.categorySlug}`}
            className="hover:text-brand-blue transition-colors capitalize"
          >
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-content-subtle" />
          <span className="font-semibold text-content-heading line-clamp-1 max-w-[200px]">
            {product.title}
          </span>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-border bg-white text-xs font-medium text-content-body hover:bg-surface-bg transition-colors"
            title="Copy product link"
          >
            {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-status-success" /> : <Share2 className="w-3.5 h-3.5 text-content-muted" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>

          <Link to="/marketplace">
            <Button variant="secondary" size="sm" leftIcon={ArrowLeft}>
              Back to Marketplace
            </Button>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          MAIN PRODUCT DETAILS GRID
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Product Image Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-surface-border shadow-card">
            <img
              src={product.image}
              alt={product.title}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isOutOfStock ? 'grayscale opacity-75' : ''
              }`}
            />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              <Badge variant={conditionVariant} size="md">
                {product.condition}
              </Badge>
              {isOutOfStock ? (
                <Badge variant="danger" size="md" dot>
                  Out of Stock
                </Badge>
              ) : isLowStock && !isDigital ? (
                <Badge variant="warning" size="md" dot>
                  Only {product.stock} items left in stock
                </Badge>
              ) : (
                <Badge variant="success" size="md" dot>
                  In Stock ({product.stock} available)
                </Badge>
              )}
            </div>
          </div>

          {/* Academic Prototype Notice Card */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-brand-blue font-semibold">
              <Info className="w-4 h-4 shrink-0" />
              <span>Academic Prototype Demonstration</span>
            </div>
            <p className="text-[11px] text-content-muted leading-relaxed">
              This product listing is an academic demonstration record for the NPC Technopreneurship course. No actual monetary exchange or retail sale takes place.
            </p>
          </div>
        </div>

        {/* Right Column: Product Info & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            {/* Category & Demo Rating */}
            <div className="flex items-center justify-between text-xs">
              <Link
                to={`/marketplace?category=${product.categorySlug}`}
                className="font-bold text-brand-blue uppercase tracking-wider hover:underline"
              >
                {product.category}
              </Link>
              <div
                className="flex items-center gap-1.5 text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-xs"
                title="Sample demonstration rating"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-content-subtle font-normal">
                  ({product.reviewsCount} sample reviews)
                </span>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-content-heading leading-tight">
              {product.title}
            </h1>

            {/* Price Block */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-surface-border">
              <span className="text-3xl font-extrabold text-content-heading tracking-tight">
                {formatPHP(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-base text-content-subtle line-through">
                    {formatPHP(product.originalPrice)}
                  </span>
                  <Badge variant="success" size="sm">
                    Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% (Sample Promo)
                  </Badge>
                </>
              )}
            </div>

            {/* Product Description */}
            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-content-heading">
                About this Item
              </h3>
              <p className="text-sm text-content-body leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Proposed Meetup Location Card */}
            <div className="p-4 bg-surface-white border border-surface-border rounded-xl space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-brand-blue font-bold text-xs uppercase tracking-wider">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Proposed Campus Meetup Spot</span>
              </div>
              <p className="text-sm font-semibold text-content-heading">
                {product.meetupLocation}
              </p>
              <p className="text-xs text-content-muted leading-relaxed">
                Proposed peer-to-peer exchange location subject to official NPC school approval. All handovers must observe proposed campus safety hours and student guidelines (subject to school administration approval).
              </p>
            </div>

            {/* Demo Seller Profile Card */}
            <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-brand-dark uppercase tracking-wider flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-brand-blue" />
                  Demo Seller Profile
                </span>
                <span className="text-[11px] text-content-muted">Sample ID: {product.seller.studentId}</span>
              </div>

              <div className="flex items-center gap-3.5">
                <InitialsAvatar
                  name={product.seller.name}
                  size="lg"
                  className="ring-2 ring-white"
                />
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-content-heading">
                    {product.seller.name}
                  </h4>
                  <p className="text-xs text-content-muted">{product.seller.program}</p>
                  <p className="text-[11px] text-brand-dark font-medium">
                    ★ {product.seller.rating} sample rating • {product.seller.salesCount} sample campus orders (Demonstration Record)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quantity Controls & Add to Cart Action */}
          <div className="pt-4 border-t border-surface-border space-y-4">
            {!isDigital && !isOutOfStock && (
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-content-heading">Select Quantity:</span>
                <div className="inline-flex items-center rounded-xl border border-surface-border bg-surface-bg p-1 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-1.5 rounded-lg text-content-muted hover:text-content-heading hover:bg-white disabled:opacity-40 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-sm text-content-heading">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="p-1.5 rounded-lg text-content-muted hover:text-content-heading hover:bg-white disabled:opacity-40 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                variant={isOutOfStock ? 'secondary' : 'primary'}
                size="lg"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                leftIcon={isOutOfStock ? Ban : ShoppingCart}
                className="flex-1 shadow-sm"
              >
                {isOutOfStock
                  ? 'Currently Out of Stock'
                  : `Add to Cart • ${formatPHP(product.price * quantity)}`}
              </Button>

              {!isOutOfStock && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleBuyNow}
                  className="sm:w-auto font-semibold"
                >
                  Buy Now
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          RELATED PRODUCTS SECTION
         ========================================================================= */}
      {relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-surface-border space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-content-heading">
                More from {product.category}
              </h3>
              <p className="text-xs text-content-muted">
                Explore related student offerings in this category.
              </p>
            </div>
            <Link
              to={`/marketplace?category=${product.categorySlug}`}
              className="text-xs font-semibold text-brand-blue hover:underline"
            >
              View all &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductCard
                key={relProduct.id}
                product={relProduct}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Quick View Modal for Related Products */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
