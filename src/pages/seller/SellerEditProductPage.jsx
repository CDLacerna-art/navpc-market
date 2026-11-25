import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/productService';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CONDITIONS,
  CAMPUS_MEETUP_SPOTS,
} from '../../utils/constants';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import {
  ArrowLeft,
  Upload,
  X,
  Save,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function SellerEditProductPage() {
  const { id } = useParams();
  const { user, profile, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const sellerId = isDemoMode ? 'demo-seller-001' : (user?.id ?? null);

  // Form states
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(PRODUCT_CATEGORIES[0]?.name || 'School Supplies');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [condition, setCondition] = useState(PRODUCT_CONDITIONS[0] || 'Brand New');
  const [pickupArrangement, setPickupArrangement] = useState(CAMPUS_MEETUP_SPOTS[0] || 'NPC Main Building Lobby (Proposed Zone)');
  const [isActive, setIsActive] = useState(true);

  // Existing images & new files
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  // Form submission feedback
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const products = await productService.getSellerProducts(sellerId);
        const product = products.find((p) => p.id === id);

        if (!product) {
          setServerError('Product not found or you do not have permission to edit it.');
          return;
        }

        setTitle(product.title || '');
        setDescription(product.description || '');
        setCategory(product.category || PRODUCT_CATEGORIES[0]?.name);
        setPrice(String(product.price || ''));
        setStock(String(product.stock ?? '0'));
        setCondition(product.condition || PRODUCT_CONDITIONS[0]);
        setPickupArrangement(product.pickup_arrangement || CAMPUS_MEETUP_SPOTS[0]);
        setIsActive(product.is_active ?? true);
        setExistingImages(product.product_images || []);
      } catch (err) {
        console.error('Error loading product details:', err);
        setServerError('Failed to load listing details.');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id, sellerId]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = [];
    const validPreviews = [];
    let fileError = null;

    files.forEach((file) => {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        fileError = `File "${file.name}" is not a supported format. Please use JPG, PNG, or WEBP.`;
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        fileError = `File "${file.name}" exceeds the 5MB size limit.`;
        return;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    });

    if (fileError) {
      setErrors((prev) => ({ ...prev, images: fileError }));
    } else {
      setErrors((prev) => ({ ...prev, images: null }));
    }

    setNewFiles((prev) => [...prev, ...validFiles]);
    setNewPreviews((prev) => [...prev, ...validPreviews]);
  };

  const removeExistingImage = (imgId) => {
    setRemovedImageIds((prev) => [...prev, imgId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== imgId));
  };

  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Product title is required';
    if (!description.trim()) errs.description = 'Product description is required';
    if (!category) errs.category = 'Category selection is required';

    const numPrice = parseFloat(price);
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      errs.price = 'Price must be greater than ₱0.00';
    }

    const numStock = parseInt(stock, 10);
    if (stock === '' || isNaN(numStock) || numStock < 0) {
      errs.stock = 'Stock quantity cannot be negative';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      setServerError(null);

      const result = await productService.updateProduct(
        id,
        sellerId,
        {
          title: title.trim(),
          description: description.trim(),
          category,
          price,
          stock,
          condition,
          pickup_arrangement: pickupArrangement,
          is_active: isActive && parseInt(stock, 10) > 0,
        },
        newFiles,
        removedImageIds
      );

      if (result.rejectedFileNames && result.rejectedFileNames.length > 0) {
        setServerError(
          `Changes saved, but the following image(s) could not be uploaded: ${result.rejectedFileNames.join(', ')}. ` +
          'Please try uploading them again.'
        );
        // Stay on page so the seller can retry the failed images
      } else {
        navigate('/seller/products');
      }
    } catch (err) {
      console.error('Failed to update product:', err);
      setServerError(err.message || 'Error updating product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Spinner size="lg" />
        <p className="text-xs text-content-muted">Loading listing data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center space-x-3">
        <Link
          to="/seller/products"
          className="p-2 rounded-lg text-content-secondary hover:text-content-heading hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-content-heading">Edit Product Listing</h1>
          <p className="text-xs text-content-muted">Update details, pricing, stock, or photos for your item.</p>
        </div>
      </div>

      {!sellerId && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Your seller profile could not be loaded. Please refresh the page or sign out and sign back in.</span>
        </div>
      )}

      {serverError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* EDIT FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BASIC DETAILS */}
        <Card padding={true} className="space-y-4">
          <div className="flex items-center justify-between border-b border-ui-border pb-2">
            <h3 className="text-sm font-bold text-content-heading">1. Listing Information</h3>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is-active-check"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-ui-border text-brand-blue focus:ring-brand-blue"
              />
              <label htmlFor="is-active-check" className="text-xs font-semibold text-content-heading cursor-pointer">
                Listing Active on Marketplace
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-heading mb-1">
              Product Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-ui-border focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none"
            />
            {errors.title && <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-heading mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-ui-border focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none"
            />
            {errors.description && <p className="text-[11px] text-rose-500 mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-content-heading mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-ui-border bg-white focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none text-content-body"
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-heading mb-1">
                Condition <span className="text-rose-500">*</span>
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-ui-border bg-white focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none text-content-body"
              >
                {PRODUCT_CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* PRICING & INVENTORY */}
        <Card padding={true} className="space-y-4">
          <h3 className="text-sm font-bold text-content-heading border-b border-ui-border pb-2">
            2. Price & Inventory Control
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-content-heading mb-1">
                Price (PHP ₱) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-content-muted">₱</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-ui-border focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none font-bold"
                />
              </div>
              {errors.price && <p className="text-[11px] text-rose-500 mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-heading mb-1">
                Available Stock <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-ui-border focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none font-bold"
              />
              {errors.stock && <p className="text-[11px] text-rose-500 mt-1">{errors.stock}</p>}
            </div>
          </div>
        </Card>

        {/* PHOTOS */}
        <Card padding={true} className="space-y-4">
          <div className="flex items-center justify-between border-b border-ui-border pb-2">
            <h3 className="text-sm font-bold text-content-heading">3. Listing Photos</h3>
            <span className="text-xs text-content-muted">
              {existingImages.length + newFiles.length} photos
            </span>
          </div>

          {/* Current Images */}
          {existingImages.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-content-muted mb-2">Current Uploaded Photos</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-lg border border-ui-border overflow-hidden bg-slate-100 group">
                    <img src={img.public_url} alt="Current product" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.id)}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Previews */}
          {newPreviews.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-brand-blue mb-2">Newly Selected Photos to Upload</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {newPreviews.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg border border-blue-300 overflow-hidden bg-blue-50/20 group">
                    <img src={url} alt={`New upload ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewFile(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          {existingImages.length + newFiles.length < 5 && (
            <label className="border-2 border-dashed border-ui-border hover:border-brand-blue rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-blue-50/20 transition-colors">
              <Upload className="w-6 h-6 text-brand-blue mb-1" />
              <span className="text-xs font-bold text-content-heading">Upload additional photos</span>
              <span className="text-[10px] text-content-muted">Max 5MB each (JPG, PNG, WEBP)</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </Card>

        {/* SUBMIT BUTTONS */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <Link to="/seller/products">
            <Button variant="secondary" size="md" disabled={isSubmitting}>
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting}
            leftIcon={Save}
          >
            {isSubmitting ? 'Saving Changes...' : 'Save Product Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
