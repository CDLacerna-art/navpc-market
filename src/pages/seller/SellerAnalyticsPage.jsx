import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/productService';
import { sellerAnalyticsService } from '../../services/sellerAnalyticsService';
import { formatPHP } from '../../utils/currency';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Package,
  Boxes,
  Info,
  Calendar,
  AlertCircle,
} from 'lucide-react';

const CATEGORY_COLORS = [
  '#2563EB', // Primary Blue
  '#3B82F6', // Blue-500
  '#10B981', // Emerald-500
  '#F59E0B', // Amber-500
  '#8B5CF6', // Purple-500
  '#EC4899', // Pink-500
  '#6B7280', // Gray-500
];

export default function SellerAnalyticsPage() {
  const { user, profile, isDemoMode } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sellerId = isDemoMode ? 'demo-seller-001' : (user?.id ?? null);

  useEffect(() => {
    async function loadAnalyticsData() {
      try {
        setLoading(true);
        const data = await productService.getSellerProducts(sellerId);
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products for analytics:', err);
        setError('Could not retrieve analytics dataset.');
      } finally {
        setLoading(false);
      }
    }
    loadAnalyticsData();
  }, [sellerId]);

  const stats = sellerAnalyticsService.calculateOverviewStats(products);
  const categoryData = sellerAnalyticsService.getCategoryBreakdown(products);
  const stockHealthData = sellerAnalyticsService.getStockHealthDistribution(products);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Spinner size="lg" />
        <p className="text-xs text-content-muted">Compiling seller analytics...</p>
      </div>
    );
  }

  if (!sellerId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3 text-center px-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-rose-500" />
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
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Badge variant="primary" size="sm">Catalog Intelligence</Badge>
            <span className="text-xs text-content-muted">Real-time Visualization</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-content-heading mt-1">
            Store & Inventory Analytics
          </h1>
          <p className="text-xs text-content-muted">
            Data-grounded insights on product distribution, stock levels, and inventory valuation.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* SUMMARY KPI ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card padding={true}>
          <span className="text-xs font-semibold text-content-muted">Catalog Listings</span>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-content-heading">{stats.totalProducts}</span>
            <span className="text-[10px] text-content-muted block">Distinct products listed</span>
          </div>
        </Card>

        <Card padding={true}>
          <span className="text-xs font-semibold text-content-muted">Active In-Stock</span>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-emerald-600">{stats.activeProducts}</span>
            <span className="text-[10px] text-content-muted block">Available for purchase</span>
          </div>
        </Card>

        <Card padding={true}>
          <span className="text-xs font-semibold text-content-muted">Units In Stock</span>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-brand-blue">{stats.totalInventoryUnits}</span>
            <span className="text-[10px] text-content-muted block">Total on-hand volume</span>
          </div>
        </Card>

        <Card padding={true}>
          <span className="text-xs font-semibold text-content-muted">Inventory Valuation</span>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-content-heading">{formatPHP(stats.totalInventoryValuation)}</span>
            <span className="text-[10px] text-content-muted block">Estimated retail value</span>
          </div>
        </Card>
      </div>

      {/* VISUAL CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Category Distribution */}
        <Card padding={true} className="space-y-4">
          <div className="flex items-center justify-between border-b border-ui-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-content-heading">Listings by Category</h3>
              <p className="text-xs text-content-muted">Product diversification across campus departments</p>
            </div>
            <PieIcon className="w-4 h-4 text-brand-blue" />
          </div>

          {categoryData.length === 0 ? (
            <div className="py-16 text-center text-xs text-content-muted">No products available for chart display.</div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} product(s)`, name]}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '11px' }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* CHART 2: Stock Health Distribution */}
        <Card padding={true} className="space-y-4">
          <div className="flex items-center justify-between border-b border-ui-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-content-heading">Inventory Health Breakdown</h3>
              <p className="text-xs text-content-muted">Normal vs low vs out-of-stock count</p>
            </div>
            <BarChart3 className="w-4 h-4 text-brand-blue" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockHealthData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="status" tick={{ fontSize: 10, fill: '#6B7280' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                <Tooltip
                  formatter={(value) => [`${value} item(s)`, 'Count']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '11px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stockHealthData.map((entry, idx) => (
                    <Cell key={`bar-${idx}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* HONEST SALES ANALYTICS EMPTY STATE */}
      <Card padding={true} className="border-dashed border-2 border-slate-300 bg-slate-50/50 text-center py-12 px-4 space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-blue-100/60 text-brand-blue flex items-center justify-center">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-brand-blue text-[11px] font-semibold">
            <Info className="w-3 h-3" />
            <span>Honest Data Grounding Notice</span>
          </div>
          <h4 className="text-sm font-bold text-content-heading">
            Sales & Revenue Analytics — Scheduled for Phase 7
          </h4>
          <p className="text-xs text-content-muted leading-relaxed">
            In accordance with the project guidelines, no simulated financial transactions or fake sales numbers are presented as live store revenue. Once real campus orders are dispatched through the Phase 7 checkout and payment system, historical revenue curves, gross sales, and top-selling product charts will populate here automatically.
          </p>
        </div>
      </Card>
    </div>
  );
}
