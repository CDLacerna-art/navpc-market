import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import ProductCard from '../../components/marketplace/ProductCard';
import ProductQuickViewModal from '../../components/marketplace/ProductQuickViewModal';
import InitialsAvatar from '../../components/common/InitialsAvatar';
import { formatPHP } from '../../utils/currency';
import { useAuth } from '../../context/AuthContext';
import { DEMO_CATEGORIES, FEATURED_PRODUCTS, RECENT_PRODUCTS } from '../../utils/demoData';
import {
  ArrowRight,
  Search,
  Store,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  TrendingUp,
  Clock,
  BookOpen,
  Utensils,
  Shirt,
  Laptop,
  Package,
  Star,
  Users,
  Coins,
  ChevronRight,
  Info
} from 'lucide-react';

export default function HomePage() {
  const { role, switchRole } = useAuth();
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/marketplace?q=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/marketplace');
    }
  };

  const handleStartSelling = () => {
    if (role !== 'seller') {
      switchRole('seller');
    }
    navigate('/seller/dashboard');
  };

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen className="w-5 h-5" />;
      case 'Utensils':
        return <Utensils className="w-5 h-5" />;
      case 'Shirt':
        return <Shirt className="w-5 h-5" />;
      case 'Laptop':
        return <Laptop className="w-5 h-5" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'Package':
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-16 pb-12">
      {/* =========================================================================
          SECTION 1 & 2: HERO SECTION
          Headline: "Everything you need, right on campus."
          Description: "Discover affordable products and services from fellow Navotas Polytechnic College students."
         ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-surface-bg border-b border-surface-border pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left 7 Columns: Headlines, Value Prop, Search & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Campus Trust Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-blue-200/80 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
                <span className="text-xs font-semibold text-brand-dark">
                  Navotas Polytechnic College • Technopreneurship Academic Initiative
                </span>
              </div>

              {/* Required Hero Headline */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-content-heading tracking-tight leading-[1.15]">
                  Everything you need, <br className="hidden sm:inline" />
                  <span className="text-brand-blue">right on campus.</span>
                </h1>
                <p className="text-base sm:text-lg text-content-body max-w-xl leading-relaxed">
                  Discover affordable products and services from fellow Navotas Polytechnic College students.
                </p>
              </div>

              {/* Hero Search Box */}
              <form onSubmit={handleHeroSearch} className="max-w-xl">
                <div className="relative flex items-center bg-white border border-surface-border rounded-xl shadow-card p-1.5 focus-within:ring-2 focus-within:ring-brand-blue/30 focus-within:border-brand-blue transition-all">
                  <div className="pl-3 text-content-muted">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search calculators, uniforms, snacks, gadgets, services..."
                    className="w-full px-3 py-2 text-xs sm:text-sm text-content-heading placeholder:text-content-subtle bg-transparent focus:outline-none"
                  />
                  <Button type="submit" variant="primary" size="md" className="shrink-0">
                    Search
                  </Button>
                </div>

                {/* Popular campus tags */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-xs text-content-muted">
                  <span className="font-semibold text-content-heading">Popular:</span>
                  {['Scientific Calculator', 'NPC Uniform', 'Homemade Brownies', 'Thesis Layout', 'Flash Drive'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setHeroSearch(tag);
                        navigate(`/marketplace?q=${encodeURIComponent(tag)}`);
                      }}
                      className="px-2 py-0.5 rounded-md bg-white border border-surface-border text-content-body hover:border-brand-blue hover:text-brand-blue transition-colors text-[11px]"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </form>

              {/* Primary & Secondary Action CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link to="/marketplace">
                  <Button
                    variant="primary"
                    size="lg"
                    rightIcon={ArrowRight}
                    className="w-full sm:w-auto shadow-md"
                  >
                    Explore Marketplace
                  </Button>
                </Link>

                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={Store}
                  onClick={handleStartSelling}
                  className="w-full sm:w-auto"
                >
                  Start Selling
                </Button>
              </div>

              {/* Three Value Trust Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-surface-border/70 max-w-lg">
                <div>
                  <div className="text-base sm:text-lg font-bold text-content-heading">100%</div>
                  <div className="text-[11px] text-content-muted">Student-to-Student</div>
                </div>
                <div>
                  <div className="text-base sm:text-lg font-bold text-brand-blue">₱0 Fee</div>
                  <div className="text-[11px] text-content-muted">Free Student Listing</div>
                </div>
                <div>
                  <div className="text-base sm:text-lg font-bold text-status-success">Safe Spots</div>
                  <div className="text-[11px] text-content-muted">NPC Campus Meetups</div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Hero Graphic Card / Live Student Listing Spotlight */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md">
                {/* Decorative background glow */}
                <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-200/50 rounded-full blur-3xl pointer-events-none" />

                {/* Main Hero Card Preview */}
                <div className="relative bg-white rounded-2xl border border-surface-border shadow-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-brand-blue text-white flex items-center justify-center">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-content-heading">Campus Deal of the Day</h3>
                        <p className="text-[10px] text-content-muted">Sample NPC Student Listing</p>
                      </div>
                    </div>
                    <Badge variant="primary" size="sm" dot>
                      Demo Seller
                    </Badge>
                  </div>

                  {/* Spotlight Image & Badge */}
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 border border-surface-border">
                    <img
                      src={FEATURED_PRODUCTS[0].image}
                      alt={FEATURED_PRODUCTS[0].title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/products/scientific-calculator.jpg';
                      }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <Badge variant="primary" size="sm">
                        {FEATURED_PRODUCTS[0].condition}
                      </Badge>
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2 py-1 rounded-md font-semibold">
                      {FEATURED_PRODUCTS[0].meetupLocation}
                    </div>
                  </div>

                  {/* Spotlight Details */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-brand-blue uppercase tracking-wider">
                        {FEATURED_PRODUCTS[0].category}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>4.8 (12)</span>
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-content-heading line-clamp-1">
                      {FEATURED_PRODUCTS[0].title}
                    </h4>
                    <p className="text-xs text-content-muted line-clamp-2">
                      {FEATURED_PRODUCTS[0].description}
                    </p>
                  </div>

                  {/* Price & Quick Interaction */}
                  <div className="flex items-center justify-between pt-2 border-t border-surface-border">
                    <div>
                      <span className="text-lg font-extrabold text-content-heading">
                        {formatPHP(FEATURED_PRODUCTS[0].price)}
                      </span>
                      <span className="text-xs text-content-subtle line-through ml-1.5">
                        {formatPHP(FEATURED_PRODUCTS[0].originalPrice)}
                      </span>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedProduct(FEATURED_PRODUCTS[0])}
                    >
                      Quick View
                    </Button>
                  </div>

                  {/* Floating Mini Seller Badge */}
                  <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <InitialsAvatar
                        name="Maria Santos"
                        size="xs"
                        className="ring-1 ring-white"
                      />
                      <span className="font-medium text-content-heading text-[11px]">
                        Maria Santos • {FEATURED_PRODUCTS[0].seller.program}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-brand-blue">
                      42 Campus Orders
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: PRODUCT CATEGORIES
          School Supplies, Food & Beverages, Clothing & Accessories, Electronics,
          Digital Services, Other Products
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <Badge variant="primary" size="sm" className="mb-1">
              Browse Campus Inventory
            </Badge>
            <h2 className="text-xl sm:text-2xl font-bold text-content-heading">
              Product & Service Categories
            </h2>
            <p className="text-xs sm:text-sm text-content-muted">
              Tailored specifically for student life and academic needs at Navotas Polytechnic College.
            </p>
          </div>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:text-brand-dark transition-colors"
          >
            <span>View all in catalog</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {DEMO_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/marketplace?category=${cat.slug}`}
              className="group bg-surface-white border border-surface-border rounded-xl p-4 flex flex-col justify-between hover:border-brand-blue hover:shadow-card-hover transition-all text-center relative overflow-hidden"
            >
              <div>
                <div className="w-12 h-12 mx-auto rounded-xl bg-brand-light text-brand-blue flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-brand-blue group-hover:text-white transition-all">
                  {getCategoryIcon(cat.icon)}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-content-heading group-hover:text-brand-blue transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-content-muted mt-1 line-clamp-2 leading-snug">
                  {cat.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-surface-border flex items-center justify-center">
                <span className="text-[10px] font-semibold text-brand-dark bg-blue-50 px-2 py-0.5 rounded-full">
                  {cat.itemCount} listings
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: FEATURED PRODUCTS
          Top-rated student products with live Cart and Quick View
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary" icon={Sparkles} size="sm">
                Editor's Campus Pick
              </Badge>
              <span className="text-[11px] text-content-subtle">
                (Fictional Demonstration Records)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-content-heading mt-1">
              Featured Student Products
            </h2>
            <p className="text-xs sm:text-sm text-content-muted">
              Hand-picked affordable items and popular services from student entrepreneurs (sample demonstration data).
            </p>
          </div>

          <Link to="/marketplace">
            <Button variant="secondary" size="sm" rightIcon={ArrowRight}>
              See All Products
            </Button>
          </Link>
        </div>

        {/* 4-Column Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_PRODUCTS.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: RECENTLY ADDED PRODUCTS
          Separate product collection showing student marketplace freshness
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="success" icon={Clock} size="sm">
                New on Campus
              </Badge>
              <span className="text-[11px] text-content-subtle">
                (Sample Data Collection)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-content-heading mt-1">
              Recently Added Products
            </h2>
            <p className="text-xs sm:text-sm text-content-muted">
              Freshly listed study gear, drinks, electronics, and supplies added this week.
            </p>
          </div>

          <Link to="/marketplace?sort=recent">
            <Button variant="secondary" size="sm" rightIcon={ArrowRight}>
              Explore New Listings
            </Button>
          </Link>
        </div>

        {/* 4-Column Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {RECENT_PRODUCTS.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: STUDENT SELLER PROMOTION
          Turn your talents, course materials, or cooking into extra income
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-brand-blue to-brand-dark rounded-2xl text-white p-6 sm:p-10 shadow-lg relative overflow-hidden">
          {/* Subtle background circles */}
          <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left 8 Cols: Benefits */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs">
                <Store className="w-3.5 h-3.5" />
                <span>Empowering Student Technopreneurs</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Got items to sell or digital skills to offer?
              </h2>

              <p className="text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed">
                Turn your pre-loved textbooks, uniforms, baked treats, or digital design talents into campus income. NavPC Market offers a free, safe, and direct channel to thousands of fellow NPC students.
              </p>

              {/* 3 Seller Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="flex items-start gap-2.5">
                  <Coins className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">0% Platform Fee</h4>
                    <p className="text-[11px] text-blue-100">Keep 100% of your earnings with peer-to-peer meetups.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Users className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Campus Customer Base</h4>
                    <p className="text-[11px] text-blue-100">Directly reach students within your colleges and classes.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-5 h-5 text-sky-300 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Class Schedule Friendly</h4>
                    <p className="text-[11px] text-blue-100">Set meetup hours that fit around your actual study timetable.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: CTA Action */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 w-full text-center space-y-3">
                <h3 className="text-sm font-bold text-white">
                  Join the Student Seller Hub
                </h3>
                <p className="text-xs text-blue-100">
                  Switch to the Student Seller role to test listing products and managing your inventory.
                </p>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleStartSelling}
                  leftIcon={Store}
                  className="w-full text-brand-dark font-bold hover:bg-white"
                >
                  Start Selling Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: HOW IT WORKS
          1. Discover Products -> 2. Connect with Sellers -> 3. Meet Up On Campus
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="primary" size="sm">
            Simple 3-Step Process
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-content-heading">
            How NavPC Market Works
          </h2>
          <p className="text-xs sm:text-sm text-content-muted">
            Engineered to make campus buying and selling friction-free, safe, and transparent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <Card padding={true} className="relative">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-base mb-4">
              1
            </div>
            <h3 className="text-sm font-bold text-content-heading mb-1.5">
              Discover Campus Listings
            </h3>
            <p className="text-xs text-content-muted leading-relaxed">
              Search by subject, category, condition (Brand New to Gently Used), or price. Filter easily for textbooks, lab supplies, food, or digital design services.
            </p>
          </Card>

          {/* Step 2 */}
          <Card padding={true} className="relative">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-base mb-4">
              2
            </div>
            <h3 className="text-sm font-bold text-content-heading mb-1.5">
              Order or Message Sellers
            </h3>
            <p className="text-xs text-content-muted leading-relaxed">
              Place items into your campus shopping cart or send a direct inquiry to the student seller regarding item condition, pickup schedule, or custom requests.
            </p>
          </Card>

          {/* Step 3 */}
          <Card padding={true} className="relative">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-base mb-4">
              3
            </div>
            <h3 className="text-sm font-bold text-content-heading mb-1.5">
              Meet Up Safely On Campus
            </h3>
            <p className="text-xs text-content-muted leading-relaxed">
              Complete the exchange in designated safe zones — the NPC Library Lobby, Student Activity Center, or Canteen. Pay in cash or via GCash upon receiving your item.
            </p>
          </Card>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: TECHNOPRENEURSHIP DISCLOSURE
          Prominent academic compliance statement
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
              <Info className="w-6 h-6" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-200/60 px-2.5 py-0.5 rounded-md">
                  Academic Compliance Notice
                </span>
                <span className="text-xs font-medium text-amber-800">
                  Technopreneurship Academic Project Proposal
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-amber-950">
                Independent Student Initiative — Navotas Polytechnic College
              </h3>

              <p className="text-xs text-amber-900/90 leading-relaxed">
                <strong>NavPC Market</strong> is a proposed, technology-based student commerce prototype conceptualized and developed as an academic requirement for the <strong>Technopreneurship</strong> curriculum. This platform is an independent student project and does not claim official institutional ownership, endorsement, partnership, or administrative affiliation with Navotas Polytechnic College. All demonstration records, student accounts, and prices are strictly for educational evaluation purposes.
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-4 text-xs font-semibold text-amber-900">
                <Link to="/about" className="underline hover:text-amber-950">
                  Read full project documentation & stack overview &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal Dialog */}
      <ProductQuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
