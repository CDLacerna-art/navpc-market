import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/productService';
import { formatPHP } from '../../utils/currency';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import {
  Package,
  PlusCircle,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  X,
  ExternalLink,
  Check,
} from 'lucide-react';

export default function SellerProductsPage() {
  const { user, profile } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Deletion modal state
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  const sellerId = user?.id || profile?.id || 'demo-seller-001';

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getSellerProducts(sellerId);
      setProducts(data);
    } catch (err) {
      console.error('Failed to load seller products:', err);
      setError('Could not retrieve your product listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [sellerId]);

  // Handle product deletion
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      setIsDeleting(true);
      await productService.deleteProduct(productToDelete.id, sellerId);
      setActionSuccess(`Listing "${productToDelete.title}" removed successfully.`);
      setProductToDelete(null);
      await loadProducts();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      console.error('Failed to delete product:', err);
      setError(err.message || 'Error deleting product.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesQuery =
          !searchQuery.trim() ||
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCat =
          selectedCategory === 'all' ||
          p.category.toLowerCase() === selectedCategory.toLowerCase();

        let matchesStatus = true;
        if (selectedStatus === 'active') matchesStatus = p.is_active && p.stock > 0;
        else if (selectedStatus === 'low') matchesStatus = p.stock > 0 && p.stock <= 3;
        else if (selectedStatus === 'out') matchesStatus = p.stock === 0;

        return matchesQuery && matchesCat && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
        if (sortBy === 'stock-low') return (a.stock || 0) - (b.stock || 0);
        if (sortBy === 'stock-high') return (b.stock || 0) - (a.stock || 0);
        return 0;
      });
  }, [products, searchQuery, selectedCategory, selectedStatus, sortBy]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-content-heading">My Product Listings</h1>
          <p className="text-xs text-content-muted">
            Manage, edit, and monitor your student merchandise on NavPC Market ({products.length} total).
          </p>
        </div>
        <Link to="/seller/products/new">
          <Button variant="primary" size="sm" leftIcon={PlusCircle}>
            Add New Product
          </Button>
        </Link>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* SEARCH AND FILTERS BAR */}
      <Card padding={true} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-content-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search listings..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-ui-border focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-heading p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-ui-border bg-white focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none text-content-body"
            >
              <option value="all">All Categories</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-ui-border bg-white focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none text-content-body"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active & In Stock</option>
              <option value="low">Low Stock (1–3)</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-ui-border bg-white focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none text-content-body"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="stock-low">Stock: Low to High</option>
              <option value="stock-high">Stock: High to Low</option>
            </select>
          </div>
        </div>
      </Card>

      {/* PRODUCTS CONTENT */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Spinner size="lg" />
          <p className="text-xs text-content-muted">Loading your products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card padding={true} className="text-center py-16 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-content-muted">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-content-heading">No Products Found</h3>
          <p className="text-xs text-content-muted max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'No products matched your active filters. Try resetting search or category parameters.'
              : "You haven't listed any student merchandise yet. Click below to add your first product."}
          </p>
          {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
            >
              Reset Filters
            </Button>
          ) : (
            <Link to="/seller/products/new">
              <Button variant="primary" size="sm" leftIcon={PlusCircle}>
                Add Your First Product
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-ui-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-ui-border text-content-muted uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-bold">Product</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Price</th>
                  <th className="py-3 px-4 font-bold">Available Stock</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ui-border/70">
                {filteredProducts.map((product) => {
                  const imgUrl = product.product_images?.[0]?.public_url;
                  const isOutOfStock = product.stock === 0;
                  const isLowStock = product.stock > 0 && product.stock <= 3;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-ui-border overflow-hidden shrink-0 flex items-center justify-center">
                            {imgUrl ? (
                              <img src={imgUrl} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-6 h-6 text-content-muted" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs sm:max-w-sm">
                            <p className="font-bold text-content-heading text-xs truncate">{product.title}</p>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="text-[10px] text-content-muted">{product.condition}</span>
                              <span className="text-[10px] text-content-muted">•</span>
                              <span className="text-[10px] text-content-muted truncate">{product.pickup_arrangement}</span>
                            </div>
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
                        <span
                          className={`font-bold ${
                            isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-content-heading'
                          }`}
                        >
                          {product.stock} in stock
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {isOutOfStock ? (
                          <Badge variant="danger" size="xs">Out of Stock</Badge>
                        ) : isLowStock ? (
                          <Badge variant="warning" size="xs">Low Stock</Badge>
                        ) : (
                          <Badge variant="success" size="xs">Active</Badge>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/seller/products/edit/${product.id}`}
                            className="p-1.5 text-content-secondary hover:text-brand-blue hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setProductToDelete(product)}
                            className="p-1.5 text-content-secondary hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR DELETION */}
      {productToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-ui-border space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-content-heading">Confirm Product Deletion</h3>
                <p className="text-xs text-content-muted">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-content-body leading-relaxed">
              Are you sure you want to delete <strong className="text-content-heading">"{productToDelete.title}"</strong>? Associated uploaded photos will also be deleted from storage.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Listing'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
