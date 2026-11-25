import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/productService';
import { formatPHP } from '../../utils/currency';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import {
  Boxes,
  Package,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Save,
  Check,
  RefreshCw,
  Search,
} from 'lucide-react';

export default function SellerInventoryPage() {
  const { user, profile, isDemoMode } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Filter state
  const [filterState, setFilterState] = useState('all'); // 'all', 'low', 'out', 'healthy'
  const [search, setSearch] = useState('');

  // Editable stock mapping: { [productId]: number }
  const [stockEdits, setStockEdits] = useState({});
  const [savingId, setSavingId] = useState(null);

  const sellerId = isDemoMode ? 'demo-seller-001' : (user?.id ?? null);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getSellerProducts(sellerId);
      setProducts(data);

      const initialEdits = {};
      data.forEach((p) => {
        initialEdits[p.id] = p.stock ?? 0;
      });
      setStockEdits(initialEdits);
    } catch (err) {
      console.error('Failed to load inventory:', err);
      setError('Could not retrieve current inventory records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [sellerId]);

  // Adjust local stock state
  const adjustStock = (productId, delta) => {
    setStockEdits((prev) => {
      const current = prev[productId] ?? 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  const handleStockInputChange = (productId, val) => {
    const parsed = parseInt(val, 10);
    setStockEdits((prev) => ({
      ...prev,
      [productId]: isNaN(parsed) ? '' : Math.max(0, parsed),
    }));
  };

  // Commit stock change to database / service
  const handleSaveStock = async (product) => {
    const newStock = stockEdits[product.id];
    if (newStock === '' || isNaN(newStock) || newStock < 0) {
      setError('Stock cannot be negative.');
      return;
    }

    try {
      setSavingId(product.id);
      setError(null);
      await productService.updateStock(product.id, sellerId, newStock);
      setFeedback(`Stock updated for "${product.title}" to ${newStock} units.`);
      setTimeout(() => setFeedback(null), 3000);
      await loadInventory();
    } catch (err) {
      console.error('Failed to update stock:', err);
      setError(err.message || 'Error updating stock on database.');
    } finally {
      setSavingId(null);
    }
  };

  // Summary counts
  const totalItems = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalValuation = products.reduce((acc, p) => acc + (p.price || 0) * (p.stock || 0), 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 3).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !search.trim() ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterState === 'low') return p.stock > 0 && p.stock <= 3;
    if (filterState === 'out') return p.stock === 0;
    if (filterState === 'healthy') return p.stock > 3;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-content-heading">Inventory & Stock Manager</h1>
          <p className="text-xs text-content-muted">
            Monitor on-hand inventory levels and avoid selling out-of-stock campus items.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={loadInventory} leftIcon={RefreshCw}>
          Refresh Stock
        </Button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {!sellerId && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Your seller profile could not be loaded. Please refresh the page or sign out and sign back in.</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* INVENTORY VALUATION & HEALTH STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card padding={true} className="flex flex-col justify-between">
          <span className="text-xs font-semibold text-content-muted">Total Units On Hand</span>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-content-heading">{totalItems}</span>
            <span className="text-[10px] text-content-muted block">Physical & digital items</span>
          </div>
        </Card>

        <Card padding={true} className="flex flex-col justify-between">
          <span className="text-xs font-semibold text-content-muted">Total Valuation</span>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-brand-blue">{formatPHP(totalValuation)}</span>
            <span className="text-[10px] text-content-muted block">Based on listing prices</span>
          </div>
        </Card>

        <Card padding={true} className={`flex flex-col justify-between ${lowStockCount > 0 ? 'bg-amber-50/20 border-amber-300' : ''}`}>
          <span className="text-xs font-semibold text-content-muted">Low Stock Warnings</span>
          <div className="mt-2">
            <span className={`text-2xl font-extrabold ${lowStockCount > 0 ? 'text-amber-700' : 'text-content-heading'}`}>
              {lowStockCount}
            </span>
            <span className="text-[10px] text-content-muted block">1 to 3 items remaining</span>
          </div>
        </Card>

        <Card padding={true} className={`flex flex-col justify-between ${outOfStockCount > 0 ? 'bg-rose-50/20 border-rose-300' : ''}`}>
          <span className="text-xs font-semibold text-content-muted">Out of Stock</span>
          <div className="mt-2">
            <span className={`text-2xl font-extrabold ${outOfStockCount > 0 ? 'text-rose-700' : 'text-content-heading'}`}>
              {outOfStockCount}
            </span>
            <span className="text-[10px] text-content-muted block">Unpurchasable items</span>
          </div>
        </Card>
      </div>

      {/* INVENTORY CONTROLS */}
      <Card padding={true} className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-content-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or category..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-ui-border focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterState('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterState === 'all'
                  ? 'bg-brand-blue text-white shadow-xs'
                  : 'bg-slate-100 text-content-body hover:bg-slate-200'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setFilterState('low')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterState === 'low'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Low Stock ({lowStockCount})
            </button>
            <button
              onClick={() => setFilterState('out')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterState === 'out'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              Out of Stock ({outOfStockCount})
            </button>
            <button
              onClick={() => setFilterState('healthy')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterState === 'healthy'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Healthy Stock
            </button>
          </div>
        </div>

        {/* INVENTORY TABLE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Spinner size="lg" />
            <p className="text-xs text-content-muted">Updating inventory matrix...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Boxes className="w-8 h-8 mx-auto text-content-muted" />
            <p className="text-xs font-semibold text-content-heading">No listings match this stock filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-ui-border text-content-muted uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-bold">Product</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Unit Price</th>
                  <th className="py-3 px-4 font-bold">Stock Status</th>
                  <th className="py-3 px-4 font-bold">Quick Stock Adjust</th>
                  <th className="py-3 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ui-border/70">
                {filteredProducts.map((product) => {
                  const currentStock = stockEdits[product.id] ?? product.stock;
                  const isModified = currentStock !== product.stock;
                  const isSaving = savingId === product.id;
                  const imgUrl = product.product_images?.[0]?.public_url;

                  const isOut = currentStock === 0;
                  const isLow = currentStock > 0 && currentStock <= 3;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-ui-border overflow-hidden shrink-0 flex items-center justify-center">
                            {imgUrl ? (
                              <img src={imgUrl} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-content-muted" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p className="font-bold text-content-heading text-xs truncate">{product.title}</p>
                            <span className="text-[10px] text-content-muted">{product.condition}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-content-body font-medium">
                        {product.category}
                      </td>

                      <td className="py-3 px-4 font-bold text-content-heading">
                        {formatPHP(product.price)}
                      </td>

                      <td className="py-3 px-4">
                        {isOut ? (
                          <Badge variant="danger" size="xs">0 — Out of Stock</Badge>
                        ) : isLow ? (
                          <Badge variant="warning" size="xs">{currentStock} — Low Stock</Badge>
                        ) : (
                          <Badge variant="success" size="xs">{currentStock} — In Stock</Badge>
                        )}
                      </td>

                      {/* QUICK ADJUSTMENT BUTTONS & INPUT */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => adjustStock(product.id, -1)}
                            disabled={currentStock <= 0 || isSaving}
                            className="w-7 h-7 rounded-md border border-ui-border hover:bg-slate-100 flex items-center justify-center text-content-secondary hover:text-content-heading disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={currentStock}
                            onChange={(e) => handleStockInputChange(product.id, e.target.value)}
                            disabled={isSaving}
                            className="w-16 px-2 py-1 text-xs text-center font-bold border border-ui-border rounded-md focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none"
                          />

                          <button
                            type="button"
                            onClick={() => adjustStock(product.id, 1)}
                            disabled={isSaving}
                            className="w-7 h-7 rounded-md border border-ui-border hover:bg-slate-100 flex items-center justify-center text-content-secondary hover:text-content-heading disabled:opacity-40 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* SAVE ACTION */}
                      <td className="py-3 px-4 text-right">
                        {isModified ? (
                          <Button
                            variant="primary"
                            size="xs"
                            onClick={() => handleSaveStock(product)}
                            disabled={isSaving}
                            leftIcon={Save}
                          >
                            {isSaving ? 'Saving...' : 'Save'}
                          </Button>
                        ) : (
                          <span className="text-[11px] text-content-muted">Synced</span>
                        )}
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
