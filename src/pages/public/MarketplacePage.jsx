import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../../components/marketplace/ProductCard';
import ProductQuickViewModal from '../../components/marketplace/ProductQuickViewModal';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import { ALL_PRODUCTS, DEMO_CATEGORIES } from '../../utils/demoData';
import { productService } from '../../services/productService';
import { formatPHP } from '../../utils/currency';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronRight,
  ArrowUpDown,
  RotateCcw,
  PackageX,
  ChevronLeft,
  Store,
  Filter,
  Check,
  Sparkles,
  BookOpen,
  Utensils,
  Shirt,
  Laptop,
  Package
} from 'lucide-react';

const ITEMS_PER_PAGE = 9;

const CONDITIONS_LIST = [
  'Brand New',
  'Like New',
  'Pre-loved',
  'Digital / Service',
];

const PRESET_PRICE_RANGES = [
  { label: 'All Prices', min: '', max: '' },
  { label: 'Under ₱100', min: '0', max: '100' },
  { label: '₱100 – ₱300', min: '100', max: '300' },
  { label: '₱300 – ₱600', min: '300', max: '600' },
  { label: 'Above ₱600', min: '600', max: '' },
];

export default function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [liveProducts, setLiveProducts] = useState([]);

  useEffect(() => {
    async function loadLiveProducts() {
      try {
        const live = await productService.getPublicProducts();
        if (live && live.length > 0) {
          setLiveProducts(live);
        }
      } catch (e) {
        console.warn('Could not load live student products:', e);
      }
    }
    loadLiveProducts();
  }, []);

  const allProducts = useMemo(() => {
    return [...liveProducts, ...ALL_PRODUCTS];
  }, [liveProducts]);

  // URL state synchronization
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'all';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const conditionParam = searchParams.get('condition') || 'all';
  const availabilityParam = searchParams.get('availability') || 'all';
  const sortParam = searchParams.get('sort') || 'recommended';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Local state for search bar input to enable typing before updating URL
  const [searchInput, setSearchInput] = useState(queryParam);

  // Keep searchInput in sync when URL changes (e.g. from navbar search or back button)
  useEffect(() => {
    setSearchInput(queryParam);
  }, [queryParam]);

  // Helper to update specific search params while preserving existing ones
  const updateFilters = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === '' || value === 'all' || value === null || value === undefined) {
        updated.delete(key);
      } else {
        updated.set(key, value);
      }
    });

    // Reset to page 1 whenever any filter/search changes (unless specifically changing page)
    if (!('page' in newParams)) {
      updated.delete('page');
    }

    setSearchParams(updated, { replace: true });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ q: searchInput.trim() });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    updateFilters({ q: '' });
  };

  const handleClearAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  // Filter and sort the complete catalog
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // 1. Search filter: search in title, description, category, and seller name
      if (queryParam) {
        const q = queryParam.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesCategory = product.category.toLowerCase().includes(q);
        const matchesSeller = product.seller.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCategory && !matchesSeller) {
          return false;
        }
      }

      // 2. Category filter
      if (categoryParam !== 'all') {
        if (product.categorySlug !== categoryParam) {
          return false;
        }
      }

      // 3. Price Range filter
      if (minPriceParam) {
        const min = parseFloat(minPriceParam);
        if (!isNaN(min) && product.price < min) {
          return false;
        }
      }
      if (maxPriceParam) {
        const max = parseFloat(maxPriceParam);
        if (!isNaN(max) && product.price > max) {
          return false;
        }
      }

      // 4. Condition filter
      if (conditionParam !== 'all') {
        if (product.condition !== conditionParam) {
          return false;
        }
      }

      // 5. Availability filter
      if (availabilityParam === 'in-stock') {
        if (product.stock <= 0) return false;
      } else if (availabilityParam === 'out-of-stock') {
        if (product.stock > 0) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sorting
      switch (sortParam) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'highest-rated':
          return b.rating - a.rating || b.reviewsCount - a.reviewsCount;
        case 'recommended':
        default:
          // Featured items first, then by rating
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return b.rating - a.rating;
      }
    });
  }, [queryParam, categoryParam, minPriceParam, maxPriceParam, conditionParam, availabilityParam, sortParam]);

  // Pagination calculation
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const currentPage = Math.min(Math.max(1, pageParam), totalPages);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (newPage) => {
    updateFilters({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine active filters for badge pills
  const activeFilters = [];
  if (queryParam) {
    activeFilters.push({
      key: 'q',
      label: `Search: "${queryParam}"`,
      onRemove: () => handleClearSearch(),
    });
  }
  if (categoryParam !== 'all') {
    const matchedCat = DEMO_CATEGORIES.find((c) => c.slug === categoryParam);
    activeFilters.push({
      key: 'category',
      label: `Category: ${matchedCat ? matchedCat.name : categoryParam}`,
      onRemove: () => updateFilters({ category: 'all' }),
    });
  }
  if (minPriceParam || maxPriceParam) {
    let priceLabel = 'Price: ';
    if (minPriceParam && maxPriceParam) priceLabel += `₱${minPriceParam} - ₱${maxPriceParam}`;
    else if (minPriceParam) priceLabel += `≥ ₱${minPriceParam}`;
    else priceLabel += `≤ ₱${maxPriceParam}`;

    activeFilters.push({
      key: 'price',
      label: priceLabel,
      onRemove: () => updateFilters({ minPrice: '', maxPrice: '' }),
    });
  }
  if (conditionParam !== 'all') {
    activeFilters.push({
      key: 'condition',
      label: `Condition: ${conditionParam}`,
      onRemove: () => updateFilters({ condition: 'all' }),
    });
  }
  if (availabilityParam !== 'all') {
    activeFilters.push({
      key: 'availability',
      label: `Availability: ${availabilityParam === 'in-stock' ? 'In Stock' : 'Out of Stock'}`,
      onRemove: () => updateFilters({ availability: 'all' }),
    });
  }

  // Count items per category in the full catalog
  const categoryCounts = useMemo(() => {
    const counts = { all: allProducts.length };
    allProducts.forEach((p) => {
      counts[p.categorySlug] = (counts[p.categorySlug] || 0) + 1;
    });
    return counts;
  }, [allProducts]);

  const getCategoryIcon = (slug) => {
    switch (slug) {
      case 'school-supplies':
        return <BookOpen className="w-4 h-4" />;
      case 'food-beverages':
        return <Utensils className="w-4 h-4" />;
      case 'clothing-accessories':
        return <Shirt className="w-4 h-4" />;
      case 'electronics':
        return <Laptop className="w-4 h-4" />;
      case 'digital-services':
        return <Sparkles className="w-4 h-4" />;
      case 'others':
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* =========================================================================
          BREADCRUMBS & MARKETPLACE HEADER
         ========================================================================= */}
      <div className="space-y-4">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-content-muted">
          <Link to="/" className="hover:text-brand-blue transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-content-subtle" />
          <span className="font-semibold text-content-heading">Marketplace</span>
          {categoryParam !== 'all' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-content-subtle" />
              <span className="text-brand-blue font-medium capitalize">
                {DEMO_CATEGORIES.find((c) => c.slug === categoryParam)?.name || categoryParam}
              </span>
            </>
          )}
        </nav>

        {/* Page Title & Demo Data Indicator */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="primary" size="sm" dot>
                Demo Catalog — 21 Sample Listings
              </Badge>
              <span className="text-[11px] text-content-subtle">
                (Academic Technopreneurship Catalog)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-content-heading tracking-tight">
              Explore the Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-content-muted mt-1 max-w-xl">
              Discover products and services offered by fellow Navotas Polytechnic College students.
            </p>
          </div>

          {/* Quick Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products, services, sellers..."
              className="w-full bg-white border border-surface-border rounded-xl pl-9 pr-8 py-2.5 text-xs sm:text-sm text-content-heading placeholder:text-content-subtle focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue shadow-xs transition-all"
            />
            <Search className="w-4 h-4 text-content-muted absolute left-3 top-3 pointer-events-none" />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-2.5 p-1 text-content-subtle hover:text-content-heading rounded-md"
                aria-label="Clear search text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* =========================================================================
          HORIZONTAL CATEGORY PILL NAVIGATION
         ========================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => updateFilters({ category: 'all' })}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
            categoryParam === 'all'
              ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
              : 'bg-white text-content-body border-surface-border hover:border-brand-blue/50'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>All Categories</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${categoryParam === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-content-muted'}`}>
            {categoryCounts.all}
          </span>
        </button>

        {DEMO_CATEGORIES.map((cat) => {
          const isActive = categoryParam === cat.slug;
          const count = categoryCounts[cat.slug] || 0;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => updateFilters({ category: cat.slug })}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                isActive
                  ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                  : 'bg-white text-content-body border-surface-border hover:border-brand-blue/50'
              }`}
            >
              {getCategoryIcon(cat.slug)}
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-content-muted'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          CONTROLS TOOLBAR: Active Filters, Mobile Filter Toggle, and Sort Dropdown
         ========================================================================= */}
      <div className="bg-white border border-surface-border rounded-xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Active Filters Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mobile Filter Drawer Button */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-bg border border-surface-border text-xs font-semibold text-content-heading hover:bg-gray-100"
          >
            <Filter className="w-3.5 h-3.5 text-brand-blue" />
            <span>Filters</span>
            {activeFilters.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand-blue text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilters.length}
              </span>
            )}
          </button>

          <span className="text-xs text-content-muted hidden sm:inline">
            Showing <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'item' : 'items'}
          </span>

          {/* Active Filter Chips */}
          {activeFilters.map((filter) => (
            <span
              key={filter.key}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-brand-dark border border-blue-200 text-xs font-medium"
            >
              <span>{filter.label}</span>
              <button
                type="button"
                onClick={filter.onRemove}
                className="text-brand-blue hover:text-brand-dark p-0.5 rounded-md hover:bg-blue-100 transition-colors"
                aria-label={`Remove filter ${filter.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {activeFilters.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="text-xs text-brand-blue hover:text-brand-dark font-medium underline px-1 py-0.5"
            >
              Reset all
            </button>
          )}
        </div>

        {/* Right: Sorting Select */}
        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="sort-select" className="text-xs text-content-muted flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-content-subtle" />
            <span>Sort by:</span>
          </label>
          <select
            id="sort-select"
            value={sortParam}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="bg-surface-bg border border-surface-border rounded-lg px-3 py-1.5 text-xs text-content-heading font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
          >
            <option value="recommended">Recommended / Default</option>
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="highest-rated">Highest Customer Rating</option>
          </select>
        </div>
      </div>

      {/* =========================================================================
          MAIN MARKETPLACE SECTION: FILTER SIDEBAR + PRODUCT GRID
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* DESKTOP FILTER SIDEBAR */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6 bg-white border border-surface-border rounded-2xl p-5 shadow-xs sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2 font-bold text-sm text-content-heading">
              <SlidersHorizontal className="w-4 h-4 text-brand-blue" />
              <span>Filter Catalog</span>
            </div>
            {activeFilters.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="text-xs text-brand-blue hover:underline font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* 1. Category Filter */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-content-heading">
              Category
            </h4>
            <div className="space-y-1 text-xs">
              <button
                type="button"
                onClick={() => updateFilters({ category: 'all' })}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  categoryParam === 'all'
                    ? 'bg-brand-light text-brand-dark font-bold'
                    : 'text-content-body hover:bg-surface-bg'
                }`}
              >
                <span>All Categories</span>
                <span className="text-[11px] text-content-muted">{categoryCounts.all}</span>
              </button>

              {DEMO_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => updateFilters({ category: cat.slug })}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                    categoryParam === cat.slug
                      ? 'bg-brand-light text-brand-dark font-bold'
                      : 'text-content-body hover:bg-surface-bg'
                  }`}
                >
                  <span className="truncate mr-2">{cat.name}</span>
                  <span className="text-[11px] text-content-muted">{categoryCounts[cat.slug] || 0}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Price Range Filter */}
          <div className="space-y-3 pt-3 border-t border-surface-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-content-heading">
              Price Range (₱)
            </h4>

            {/* Quick Price Range Chips */}
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              {PRESET_PRICE_RANGES.map((preset) => {
                const isActive = minPriceParam === preset.min && maxPriceParam === preset.max;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => updateFilters({ minPrice: preset.min, maxPrice: preset.max })}
                    className={`px-2 py-1 rounded-md border text-center transition-all ${
                      isActive
                        ? 'bg-brand-blue text-white border-brand-blue font-bold shadow-xs'
                        : 'bg-surface-bg border-surface-border text-content-body hover:border-brand-blue/50'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Min and Max numerical inputs */}
            <div className="flex items-center gap-2 pt-1">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-2 text-xs text-content-muted">₱</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPriceParam}
                  onChange={(e) => updateFilters({ minPrice: e.target.value })}
                  className="w-full pl-6 pr-2 py-1.5 bg-surface-bg border border-surface-border rounded-lg text-xs text-content-heading focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  min="0"
                />
              </div>
              <span className="text-content-muted text-xs">—</span>
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-2 text-xs text-content-muted">₱</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPriceParam}
                  onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                  className="w-full pl-6 pr-2 py-1.5 bg-surface-bg border border-surface-border rounded-lg text-xs text-content-heading focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* 3. Product Condition Filter */}
          <div className="space-y-2.5 pt-3 border-t border-surface-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-content-heading">
              Product Condition
            </h4>
            <div className="space-y-1.5 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-content-body hover:text-content-heading">
                <input
                  type="radio"
                  name="condition-filter"
                  checked={conditionParam === 'all'}
                  onChange={() => updateFilters({ condition: 'all' })}
                  className="text-brand-blue focus:ring-brand-blue"
                />
                <span>All Conditions</span>
              </label>

              {CONDITIONS_LIST.map((condition) => (
                <label key={condition} className="flex items-center gap-2 cursor-pointer text-content-body hover:text-content-heading">
                  <input
                    type="radio"
                    name="condition-filter"
                    checked={conditionParam === condition}
                    onChange={() => updateFilters({ condition })}
                    className="text-brand-blue focus:ring-brand-blue"
                  />
                  <span>{condition}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 4. Availability Filter */}
          <div className="space-y-2.5 pt-3 border-t border-surface-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-content-heading">
              Availability
            </h4>
            <div className="space-y-1.5 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-content-body hover:text-content-heading">
                <input
                  type="radio"
                  name="availability-filter"
                  checked={availabilityParam === 'all'}
                  onChange={() => updateFilters({ availability: 'all' })}
                  className="text-brand-blue focus:ring-brand-blue"
                />
                <span>All Items</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-content-body hover:text-content-heading">
                <input
                  type="radio"
                  name="availability-filter"
                  checked={availabilityParam === 'in-stock'}
                  onChange={() => updateFilters({ availability: 'in-stock' })}
                  className="text-brand-blue focus:ring-brand-blue"
                />
                <span>In Stock Only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-content-body hover:text-content-heading">
                <input
                  type="radio"
                  name="availability-filter"
                  checked={availabilityParam === 'out-of-stock'}
                  onChange={() => updateFilters({ availability: 'out-of-stock' })}
                  className="text-brand-blue focus:ring-brand-blue"
                />
                <span>Out of Stock</span>
              </label>
            </div>
          </div>
        </aside>

        {/* PRODUCT GRID & EMPTY STATES */}
        <main className="lg:col-span-3 space-y-6">
          {paginatedProducts.length > 0 ? (
            <>
              {/* Responsive Product Grid: 3 cols on desktop, 2 cols on tablet, 1-2 on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>

              {/* =========================================================================
                  PAGINATION CONTROLS
                 ========================================================================= */}
              {totalPages > 1 && (
                <div className="border-t border-surface-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-content-muted">
                    Showing <strong className="text-content-heading">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</strong> to{' '}
                    <strong className="text-content-heading">
                      {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
                    </strong>{' '}
                    of <strong className="text-content-heading">{totalItems}</strong> campus products
                  </p>

                  <div className="inline-flex items-center gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      leftIcon={ChevronLeft}
                    >
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                            currentPage === pageNum
                              ? 'bg-brand-blue text-white shadow-xs'
                              : 'bg-white text-content-body hover:bg-gray-100 border border-surface-border'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      rightIcon={ChevronRight}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* =========================================================================
               EMPTY STATE WHEN NO MATCHING PRODUCTS
               ========================================================================= */
            <div className="bg-white border border-surface-border rounded-2xl p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center">
                <PackageX className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-content-heading">
                  No matching campus products found
                </h3>
                <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
                  We couldn't find any student listings matching your search or active filter criteria. Try adjusting your search query, price range, or category.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleClearAllFilters}
                  leftIcon={RotateCcw}
                >
                  Reset All Filters
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          MOBILE SLIDE-OVER FILTER DRAWER
         ========================================================================= */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFiltersOpen(false)}
          />

          {/* Drawer container */}
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 p-5 space-y-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div className="flex items-center gap-2 font-bold text-sm text-content-heading">
                <SlidersHorizontal className="w-4 h-4 text-brand-blue" />
                <span>Filter Catalog</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1.5 rounded-lg text-content-muted hover:bg-surface-bg"
                aria-label="Close filters drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Category */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-content-heading">
                Category
              </h4>
              <div className="space-y-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    updateFilters({ category: 'all' });
                    setMobileFiltersOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left ${
                    categoryParam === 'all' ? 'bg-brand-light text-brand-dark font-bold' : 'text-content-body'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="text-[11px] text-content-muted">{categoryCounts.all}</span>
                </button>
                {DEMO_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      updateFilters({ category: cat.slug });
                      setMobileFiltersOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left ${
                      categoryParam === cat.slug ? 'bg-brand-light text-brand-dark font-bold' : 'text-content-body'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[11px] text-content-muted">{categoryCounts[cat.slug] || 0}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Price */}
            <div className="space-y-2 pt-3 border-t border-surface-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-content-heading">
                Price Range (₱)
              </h4>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {PRESET_PRICE_RANGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      updateFilters({ minPrice: preset.min, maxPrice: preset.max });
                      setMobileFiltersOpen(false);
                    }}
                    className="p-1.5 rounded border border-surface-border bg-surface-bg text-center text-[11px]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Condition */}
            <div className="space-y-2 pt-3 border-t border-surface-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-content-heading">
                Condition
              </h4>
              <div className="space-y-1 text-xs">
                {['all', ...CONDITIONS_LIST].map((c) => (
                  <label key={c} className="flex items-center gap-2 cursor-pointer py-1">
                    <input
                      type="radio"
                      name="m-condition"
                      checked={conditionParam === c}
                      onChange={() => {
                        updateFilters({ condition: c });
                        setMobileFiltersOpen(false);
                      }}
                      className="text-brand-blue"
                    />
                    <span className="capitalize">{c === 'all' ? 'All Conditions' : c}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mobile Availability */}
            <div className="space-y-2 pt-3 border-t border-surface-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-content-heading">
                Availability
              </h4>
              <div className="space-y-1 text-xs">
                {[
                  { id: 'all', label: 'All Items' },
                  { id: 'in-stock', label: 'In Stock Only' },
                  { id: 'out-of-stock', label: 'Out of Stock' },
                ].map((a) => (
                  <label key={a.id} className="flex items-center gap-2 cursor-pointer py-1">
                    <input
                      type="radio"
                      name="m-avail"
                      checked={availabilityParam === a.id}
                      onChange={() => {
                        updateFilters({ availability: a.id });
                        setMobileFiltersOpen(false);
                      }}
                      className="text-brand-blue"
                    />
                    <span>{a.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-surface-border flex items-center gap-2 mt-auto">
              <Button
                variant="primary"
                size="md"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1"
              >
                Apply Filters
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  handleClearAllFilters();
                  setMobileFiltersOpen(false);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK VIEW MODAL */}
      <ProductQuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
