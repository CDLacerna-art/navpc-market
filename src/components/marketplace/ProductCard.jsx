import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { formatPHP } from '../../utils/currency';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Eye, Star, MapPin, Ban } from 'lucide-react';

export default function ProductCard({
  product,
  onQuickView,
}) {
  const { addToCart } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

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

  return (
    <Card padding={false} hoverable className="group flex flex-col h-full overflow-hidden">
      {/* Image Container with Badges */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        {/* Placeholder skeleton before load */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse" />
        )}

        <img
          src={imageError ? 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80' : product.image}
          alt={product.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            isOutOfStock ? 'grayscale opacity-75' : ''
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Floating Condition & Stock Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          <Badge variant={conditionVariant} size="sm">
            {product.condition}
          </Badge>
          {isOutOfStock ? (
            <Badge variant="danger" size="sm" dot>
              Out of Stock
            </Badge>
          ) : isLowStock && !isDigital ? (
            <Badge variant="warning" size="sm" dot>
              Only {product.stock} left
            </Badge>
          ) : null}
        </div>

        {/* Quick View overlay button */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
          <button
            type="button"
            onClick={() => onQuickView && onQuickView(product)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 hover:bg-white text-content-heading rounded-lg text-xs font-semibold shadow-md transition-all active:scale-95"
            title="Quick view product details"
          >
            <Eye className="w-3.5 h-3.5 text-brand-blue" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px] text-content-muted mb-1">
            <span className="font-semibold text-brand-blue uppercase tracking-wider truncate mr-1">
              {product.category}
            </span>
            <div className="flex items-center gap-1 font-medium text-amber-600 shrink-0" title="Sample demonstration rating">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-[10px] text-content-subtle font-normal">({product.reviewsCount} sample)</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-bold text-content-heading line-clamp-2 hover:text-brand-blue transition-colors leading-snug">
            <Link to={`/product/${product.id}`} title={product.title}>
              {product.title}
            </Link>
          </h3>

          {/* Seller Snapshot */}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-surface-border/60">
            <img
              src={product.seller.avatar}
              alt={product.seller.name}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-surface-border"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-content-heading truncate leading-tight">
                {product.seller.name} <span className="text-[10px] text-brand-blue font-normal">(Demo Seller)</span>
              </p>
              <p className="text-[10px] text-content-muted truncate leading-tight">
                {product.seller.program}
              </p>
            </div>
          </div>
        </div>

        {/* Pricing and Cart Action */}
        <div className="pt-2 border-t border-surface-border flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-content-heading tracking-tight">
                {formatPHP(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-[11px] text-content-subtle line-through">
                  {formatPHP(product.originalPrice)}
                </span>
              )}
            </div>
            <p className="text-[10px] text-content-muted flex items-center gap-0.5 truncate max-w-[125px]" title="Proposed campus meetup location (subject to school approval)">
              <MapPin className="w-2.5 h-2.5 text-brand-blue shrink-0" />
              <span className="truncate">{product.meetupLocation}</span>
            </p>
          </div>

          <Button
            type="button"
            variant={isOutOfStock ? 'secondary' : 'primary'}
            size="sm"
            disabled={isOutOfStock}
            onClick={() => !isOutOfStock && addToCart(product)}
            leftIcon={isOutOfStock ? Ban : ShoppingCart}
            title={isOutOfStock ? 'Currently out of stock' : 'Add to campus cart'}
            className="shrink-0"
          >
            {isOutOfStock ? 'Sold Out' : 'Add'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
