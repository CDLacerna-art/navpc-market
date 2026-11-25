/**
 * NavPC Market — Seller Analytics & Inventory Calculations
 * 
 * Computes live, honest metrics derived from actual product and inventory records.
 * Explicitly guards against fabricated sales or transaction data.
 */

export const sellerAnalyticsService = {
  /**
   * Calculate live summary metrics from the seller's actual product list
   */
  calculateOverviewStats(products = []) {
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.is_active && !p.is_archived && p.stock > 0).length;
    const outOfStockProducts = products.filter((p) => p.stock === 0).length;
    const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 3).length;
    
    const totalInventoryUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
    const totalInventoryValuation = products.reduce((acc, p) => acc + ((p.price || 0) * (p.stock || 0)), 0);

    return {
      totalProducts,
      activeProducts,
      outOfStockProducts,
      lowStockProducts,
      totalInventoryUnits,
      totalInventoryValuation,
      // Honest accounting: No live buyer-order payments processed in Phase 6.
      totalSales: 0,
      completedOrdersCount: 0,
      hasRealSalesData: false,
    };
  },

  /**
   * Group products by category for Recharts visualization
   */
  getCategoryBreakdown(products = []) {
    const counts = {};
    products.forEach((p) => {
      const cat = p.category || 'Uncategorized';
      if (!counts[cat]) {
        counts[cat] = { name: cat, count: 0, stock: 0 };
      }
      counts[cat].count += 1;
      counts[cat].stock += (p.stock || 0);
    });

    return Object.values(counts);
  },

  /**
   * Group inventory into stock health brackets for Recharts
   */
  getStockHealthDistribution(products = []) {
    let healthyCount = 0;
    let lowCount = 0;
    let outCount = 0;

    products.forEach((p) => {
      if (p.stock === 0) {
        outCount += 1;
      } else if (p.stock <= 3) {
        lowCount += 1;
      } else {
        healthyCount += 1;
      }
    });

    return [
      { status: 'Normal Stock (>3)', count: healthyCount, fill: '#2563EB' },
      { status: 'Low Stock (1–3)', count: lowCount, fill: '#F59E0B' },
      { status: 'Out of Stock (0)', count: outCount, fill: '#EF4444' },
    ];
  },
};
