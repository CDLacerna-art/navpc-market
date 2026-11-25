import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/productService';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CONDITIONS,
  CAMPUS_MEETUP_SPOTS,
} from '../../utils/constants';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  ArrowLeft,
  Upload,
  X,
  Package,
  PlusCircle,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function SellerAddProductPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const sellerId = user?.id || profile?.id || 'demo-seller-001';

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(PRODUCT_CATEGORIES[0]?.name || 'School Supplies');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [condition, setCondition] = useState(PRODUCT_CONDITIONS[0] || 'Brand New');
  const [pickupArrangement, setPickupArrangement] = useState(CAMPUS_MEETUP_SPOTS[0] || 'NPC Main Building Lobby (Proposed Zone)');
  const [tagsInput, setTagsInput] = useState('');

  // Image files & previews
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // Form submission & feedback
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newFiles = [];
    const newPreviews = [];
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
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    if (fileError) {
      setErrors((prev) => ({ ...prev, images: fileError }));
    } else {
      setErrors((prev) => ({ ...prev, images: null }));
    }

    setSelectedFiles((prev) => [...prev, ...newFiles].slice(0, 5));
    setPreviews((prev) => [...prev, ...newPreviews].slice(0, 5));
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
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

    if (!condition) errs.condition = 'Condition selection is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      setServerError(null);

      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await productService.createProduct(
        {
          sellerId,
          title,
          description,
          category,
          price,
          stock,
          condition,
          pickupArrangement,
          tags: parsedTags,
        },
        selectedFiles
      );

      navigate('/seller/products');
    } catch (err) {
      console.error('Failed to create product listing:', err);
      setServerError(err.message || 'Error publishing listing. Please check your connection and inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            to="/seller/products"
            className="p-2 rounded-lg text-content-secondary hover:text-content-heading hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-content-heading">Add New Product</h1>
            <p className="text-xs text-content-muted">
              List student merchandise or study essentials on NavPC Market.
            </p>
          </div>
        </div>
      </div>

      {serverError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* PRODUCT CREATION FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BASIC DETAILS */}
        <Card padding={true} className="space-y-4">
          <h3 className="text-sm font-bold text-content-heading border-b border-ui-border pb-2">
            1. Basic Listing Information
          </h3>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-content-heading mb-1">
              Product Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Casio fx-991ES Plus Scientific Calculator (2nd Gen)"
              className={`w-full px-3 py-2 text-xs rounded-lg border outline-none transition-colors ${
                errors.title
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-ui-border focus:border-brand-blue focus:ring-1 focus:ring-brand-blue'
              }`}
            />
            {errors.title && <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-content-heading mb-1">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe condition, reason for selling, inclusions, or any relevant course requirements..."
              className={`w-full px-3 py-2 text-xs rounded-lg border outline-none transition-colors ${
                errors.description
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-ui-border focus:border-brand-blue focus:ring-1 focus:ring-brand-blue'
              }`}
            />
            {errors.description && <p className="text-[11px] text-rose-500 mt-1">{errors.description}</p>}
          </div>

          {/* Category & Condition */}
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
                Item Condition <span className="text-rose-500">*</span>
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
            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-content-heading mb-1">
                Price (Philippine Pesos ₱) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-content-muted">
                  ₱
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-8 pr-3 py-2 text-xs rounded-lg border outline-none font-bold ${
                    errors.price
                      ? 'border-rose-400 focus:border-rose-500'
                      : 'border-ui-border focus:border-brand-blue'
                  }`}
                />
              </div>
              {errors.price && <p className="text-[11px] text-rose-500 mt-1">{errors.price}</p>}
            </div>

            {/* Stock */}
            <div>
              <label className="block text-xs font-semibold text-content-heading mb-1">
                Available Stock Units <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="1"
                className={`w-full px-3 py-2 text-xs rounded-lg border outline-none font-bold ${
                  errors.stock
                    ? 'border-rose-400 focus:border-rose-500'
                    : 'border-ui-border focus:border-brand-blue'
                }`}
              />
              {errors.stock && <p className="text-[11px] text-rose-500 mt-1">{errors.stock}</p>}
              <p className="text-[10px] text-content-muted mt-1">
                Setting stock to 0 marks the listing as Out of Stock automatically.
              </p>
            </div>
          </div>
        </Card>

        {/* CAMPUS MEETUP & TAGS */}
        <Card padding={true} className="space-y-4">
          <h3 className="text-sm font-bold text-content-heading border-b border-ui-border pb-2">
            3. Proposed Campus Meetup Arrangement
          </h3>

          <div>
            <label className="block text-xs font-semibold text-content-heading mb-1">
              Proposed Meetup Zone (Subject to NPC School Approval)
            </label>
            <select
              value={pickupArrangement}
              onChange={(e) => setPickupArrangement(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-ui-border bg-white focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none text-content-body"
            >
              {CAMPUS_MEETUP_SPOTS.map((spot) => (
                <option key={spot} value={spot}>
                  {spot}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-heading mb-1">
              Search Tags (Optional, comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. calculator, math, engineering, casio"
              className="w-full px-3 py-2 text-xs rounded-lg border border-ui-border focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none"
            />
          </div>
        </Card>

        {/* PRODUCT PHOTOS */}
        <Card padding={true} className="space-y-4">
          <div className="flex items-center justify-between border-b border-ui-border pb-2">
            <div>
              <h3 className="text-sm font-bold text-content-heading">4. Product Photos (Supabase Storage)</h3>
              <p className="text-xs text-content-muted">Upload up to 5 clear photos of your actual item.</p>
            </div>
            <span className="text-xs text-content-muted">{selectedFiles.length} / 5 photos</span>
          </div>

          {errors.images && (
            <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
              {errors.images}
            </p>
          )}

          {/* Upload Dropzone */}
          {selectedFiles.length < 5 && (
            <label className="border-2 border-dashed border-ui-border hover:border-brand-blue rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-blue-50/30 transition-colors">
              <Upload className="w-8 h-8 text-brand-blue mb-2" />
              <span className="text-xs font-bold text-content-heading">Click to upload photos</span>
              <span className="text-[10px] text-content-muted mt-1">JPG, PNG, or WEBP (Max 5MB each)</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}

          {/* Previews Grid */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              {previews.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg border border-ui-border overflow-hidden bg-slate-100 group">
                  <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 bg-brand-blue text-white text-[9px] px-1.5 py-0.5 rounded font-semibold">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
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
            leftIcon={PlusCircle}
          >
            {isSubmitting ? 'Publishing Listing...' : 'Publish Product Listing'}
          </Button>
        </div>
      </form>
    </div>
  );
}
