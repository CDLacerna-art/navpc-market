import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/productService';
import { sellerAnalyticsService } from '../../services/sellerAnalyticsService';
import { formatPHP } from '../../utils/currency';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import {
  Package,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Boxes,
  TrendingUp,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';

export default function SellerOverviewPage() {
  const { user, profile, isDemoMode } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sellerId = isDemoMode ? 'demo-seller-001' : (user?.id ?? null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await productService.getSellerProducts(sellerId);
        setProducts(data);
      } catch (err) {
        console.error('Failed to load seller dashboard products:', err);
        setError('Failed to fetch product data from server.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sellerId]);

  const stats = sellerAnalyticsService.calculateOverviewStats(products);
  const recentProducts = products.slice(0, 5);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Spinner size="lg" />
        <p className="text-xs text-content-muted">Loading your seller metrics...</p>
      </div>
    );
  }

  if (!sellerId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3 text-center px-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 flex items-center justify-center">
          <XCircle className="w-6 h-6 text-rose-500" />
        </div>
        <h3 className="text-sm font-bold text-content-heading">Seller Profile Unavailable</h3>
        <p className="text-xs text-content-muted max-w-sm">
          Your seller profile could not be loaded. Please refresh the page or sign out and sign back in.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Badge variant="primary" size="sm">Student Merchant</Badge>
            <span className="text-xs text-content-muted">Campus Store</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-content-heading mt-1">
            Dashboard Overview
          </h1>
          <p className="text-xs text-content-muted">
            Live inventory and listing analytics for your student store.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link to="/seller/products/new">
            <Button variant="primary" size="sm" leftIcon={PlusCircle}>
              Add Product
            </Button>
          </Link>
          <Link to="/seller/inventory">
            <Button variant="secondary" size="sm" leftIcon={Boxes}>
              Manage Stock
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Products */}
        <Card padding={true} className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-content-muted">Total Listings</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-content-heading">{stats.totalProducts}</span>
            <span className="text-[10px] text-content-muted block mt-0.5">Catalog items</span>
          </div>
        </Card>

        {/* Metric 2: Active Products */}
        <Card padding={true} className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-content-muted">Active Listings</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-emerald-700">{stats.activeProducts}</span>
            <span className="text-[10px] text-content-muted block mt-0.5">Live on marketplace</span>
          </div>
        </Card>

        {/* Metric 3: Low Stock Alert */}
        <Card padding={true} className={`flex flex-col justify-between ${stats.lowStockProducts > 0 ? 'border-amber-300 bg-amber-50/20' : ''}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-content-muted">Low Stock (1–3)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-extrabold ${stats.lowStockProducts > 0 ? 'text-amber-700' : 'text-content-heading'}`}>
              {stats.lowStockProducts}
            </span>
            <span className="text-[10px] text-content-muted block mt-0.5">Requires restock</span>
          </div>
        </Card>

        {/* Metric 4: Out of Stock */}
        <Card padding={true} className={`flex flex-col justify-between ${stats.outOfStockProducts > 0 ? 'border-rose-300 bg-rose-50/20' : ''}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-content-muted">Out of Stock</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-extrabold ${stats.outOfStockProducts > 0 ? 'text-rose-700' : 'text-content-heading'}`}>
              {stats.outOfStockProducts}
            </span>
            <span className="text-[10px] text-content-muted block mt-0.5">Unavailable to buyers</span>
          </div>
        </Card>
      </div>

      {/* SECONDARY ROW: Valuation & Sales Notice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding={true} className="col-span-1 bg-gradient-to-br from-blue-50 to-indigo-50/40 border-blue-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">Inventory Value</span>
            <Boxes className="w-4 h-4 text-brand-blue" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-content-heading">
              {formatPHP(stats.totalInventoryValuation)}
            </span>
            <p className="text-xs text-content-muted mt-1">
              Across <strong className="text-content-heading">{stats.totalInventoryUnits}</strong> total units in stock.
            </p>
          </div>
        </Card>

        <Card padding={true} className="col-span-1 md:col-span-2 flex flex-col justify-center">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100/60 text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-xs font-bold text-content-heading">Phase 6 Scope Notice</h4>
                <Badge variant="secondary" size="xs">Phase 6 Active</Badge>
              </div>
              <p className="text-xs text-content-muted mt-1 leading-relaxed">
                Student sellers can create, edit, upload photos for, and manage inventory for their listings. Simulated campus checkout orders from Phase 4 remain in local evaluation storage; live buyer-to-seller order settlement and payout dispatch will be connected in <strong>Phase 7</strong>.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* RECENT LISTINGS TABLE */}
      <Card padding={true} className="space-y-4">
        <div className="flex items-center justify-between border-b border-ui-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-content-heading">Recent Product Listings</h3>
            <p className="text-xs text-content-muted">Your latest listings added to the NPC student marketplace</p>
          </div>
          <Link
            to="/seller/products"
            className="text-xs font-semibold text-brand-blue hover:text-brand-dark flex items-center space-x-1"
          >
            <span>View All ({products.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentProducts.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-content-muted">
              <Package className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-content-heading">No Products Listed Yet</h4>
            <p className="text-xs text-content-muted max-w-sm mx-auto">
              Start showcasing your pre-loved textbooks, uniforms, or snacks to the NPC campus.
            </p>
            <Link to="/seller/products/new">
              <Button variant="primary" size="sm" leftIcon={PlusCircle}>
                Create Your First Listing
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-ui-border text-content-muted uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Stock</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ui-border/60">
                {recentProducts.map((product) => {
                  const imgUrl = product.product_images?.[0]?.public_url;
                  const isOutOfStock = product.stock === 0;
                  const isLowStock = product.stock > 0 && product.stock <= 3;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-md bg-slate-100 border border-ui-border overflow-hidden shrink-0 flex items-center justify-center">
                            {imgUrl ? (
                              <img src={imgUrl} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-content-muted" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p className="font-semibold text-content-heading truncate">{product.title}</p>
                            <span className="text-[10px] text-content-muted">{product.condition}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-content-body font-medium">{product.category}</td>
                      <td className="py-3 px-3 font-bold text-content-heading">{formatPHP(product.price)}</td>
                      <td className="py-3 px-3">
                        <span className={`font-semibold ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-content-heading'}`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {isOutOfStock ? (
                          <Badge variant="danger" size="xs">Out of Stock</Badge>
                        ) : isLowStock ? (
                          <Badge variant="warning" size="xs">Low Stock</Badge>
                        ) : (
                          <Badge variant="success" size="xs">Active</Badge>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          to={`/seller/products/edit/${product.id}`}
                          className="text-brand-blue hover:text-brand-dark font-semibold text-xs inline-block"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
