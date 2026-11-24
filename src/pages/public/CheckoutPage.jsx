import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatPHP } from '../../utils/currency';
import { CAMPUS_MEETUP_SPOTS } from '../../utils/constants';
import { orderService } from '../../services/orderService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import {
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  DollarSign,
  Smartphone,
  Info,
  ShoppingCart,
  Lock
} from 'lucide-react';

const MEETUP_TIME_WINDOWS = [
  'Morning Study Break (9:30 AM – 11:00 AM)',
  'Lunch Break (11:30 AM – 1:30 PM)',
  'Afternoon Period (2:00 PM – 4:30 PM)',
  'Dismissal Window (4:30 PM – 6:00 PM)',
];

export default function CheckoutPage() {
  const { cartItems, totalItems, subtotal, clearCart } = useCart();
  const { profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionLockRef = useRef(false);

  // Redirect to /cart if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !submissionLockRef.current) {
      navigate('/cart', { replace: true });
    }
  }, [cartItems, navigate]);

  // Form State — empty fields with gray placeholder text
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    contactNumber: '',
    collegeProgram: '',
    email: '',
    meetupLocation: CAMPUS_MEETUP_SPOTS[0],
    customLocation: '',
    meetupSchedule: MEETUP_TIME_WINDOWS[1],
    paymentMethod: 'Cash on Campus Meetup',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  if (cartItems.length === 0) {
    return null; // Will redirect via useEffect
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required.';
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required.';
    if (!formData.meetupLocation) newErrors.meetupLocation = 'Please select a proposed meetup location.';
    if (formData.meetupLocation === 'Other' && !formData.customLocation.trim()) {
      newErrors.customLocation = 'Please specify the proposed meetup spot.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prevent duplicate submission with synchronous lock ref
    if (submissionLockRef.current || isSubmitting) {
      return;
    }

    if (!validateForm()) {
      showToast('Please correct the required fields.', 'error');
      return;
    }

    if (cartItems.length === 0) {
      showToast('Cart is empty. Cannot submit order.', 'error');
      navigate('/cart', { replace: true });
      return;
    }

    // Set lock immediately before any async work
    submissionLockRef.current = true;
    setIsSubmitting(true);

    // Final chosen location
    const chosenLocation =
      formData.meetupLocation === 'Other'
        ? `${formData.customLocation} (Proposed Zone)`
        : formData.meetupLocation;

    // Simulate order creation with catalog recalculation
    setTimeout(() => {
      try {
        const createdOrder = orderService.createDemoOrder({
          buyer: {
            fullName: formData.fullName.trim(),
            contactNumber: formData.contactNumber.trim(),
            studentId: formData.studentId.trim() || 'N/A',
            collegeProgram: formData.collegeProgram.trim() || 'N/A',
            email: formData.email.trim() || 'N/A',
          },
          items: cartItems,
          paymentMethod: formData.paymentMethod,
          meetupLocation: chosenLocation,
          meetupSchedule: formData.meetupSchedule,
          notes: formData.notes.trim(),
        });

        // Clear the cart immediately so back-button cannot resubmit for same items
        clearCart();
        setIsSubmitting(false);
        showToast('Demonstration order submitted successfully!', 'success');

        // Navigate to confirmation page
        navigate(`/order-confirmation/${createdOrder.id}`, { replace: true });
      } catch (err) {
        console.error('Order creation failed:', err);
        submissionLockRef.current = false;
        setIsSubmitting(false);
        showToast('Order creation failed. Please try again.', 'error');
      }
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* =========================================================================
          BREADCRUMBS & HEADER
         ========================================================================= */}
      <div className="space-y-2 border-b border-surface-border pb-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-content-muted">
          <Link to="/" className="hover:text-brand-blue transition-colors">
            Home
          </Link>
          <span className="text-content-subtle">/</span>
          <Link to="/cart" className="hover:text-brand-blue transition-colors">
            Shopping Cart
          </Link>
          <span className="text-content-subtle">/</span>
          <span className="font-semibold text-content-heading">Demonstration Checkout</span>
        </nav>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm" dot>
              Academic Demonstration Checkout
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-heading tracking-tight">
            Simulated Campus Checkout
          </h1>
          <p className="text-xs sm:text-sm text-content-muted mt-1">
            Review your buyer details and coordinate a proposed campus meetup fulfillment.
          </p>
        </div>
      </div>

      {/* Prominent Academic Prototype Notice */}
      <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-start gap-3.5 text-xs text-amber-900 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-950">
            Technopreneurship Academic Prototype — No Real Financial Transactions
          </p>
          <p className="leading-relaxed">
            This checkout flow is a simulated demonstration for academic compliance. No payment gateway is connected, and no monetary funds will be collected. All meetup spots are proposed and subject to official NPC school approval.
          </p>
          <p className="text-[11px] font-semibold text-amber-900/90 pt-0.5">
            🔒 Demo data stays in this browser and is not sent anywhere.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Fields (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Buyer Information */}
          <Card padding={true} className="space-y-4">
            <Card.Header>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-brand-blue" />
                <Card.Title>1. Student Buyer Information</Card.Title>
              </div>
              <Card.Description>
                Provide your contact details so the student seller can recognize you during meetup.
              </Card.Description>
            </Card.Header>

            <Card.Body>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Full Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-content-heading">Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="e.g. Juan Dela Cruz"
                    className="form-input"
                  />
                  {errors.fullName && <p className="text-[11px] text-status-danger">{errors.fullName}</p>}
                </div>

                {/* Contact Number */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-content-heading">Mobile Contact Number *</label>
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => handleChange('contactNumber', e.target.value)}
                    placeholder="e.g. 0917-555-1234"
                    className="form-input"
                  />
                  {errors.contactNumber && <p className="text-[11px] text-status-danger">{errors.contactNumber}</p>}
                </div>

                {/* Student ID (Optional) */}
                <div className="space-y-1">
                  <label className="font-semibold text-content-heading">Student ID Number (Optional)</label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => handleChange('studentId', e.target.value)}
                    placeholder="e.g. 2023-10492"
                    className="form-input placeholder:text-gray-400"
                  />
                </div>

                {/* College Program (Optional) */}
                <div className="space-y-1">
                  <label className="font-semibold text-content-heading">College Department / Program (Optional)</label>
                  <input
                    type="text"
                    value={formData.collegeProgram}
                    onChange={(e) => handleChange('collegeProgram', e.target.value)}
                    placeholder="e.g. BS Information Technology (BSIT)"
                    className="form-input placeholder:text-gray-400"
                  />
                </div>

                {/* Email (Optional) */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-content-heading">Student Email (Optional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="e.g. student@example.com"
                    className="form-input placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="mt-3 p-2.5 bg-surface-bg rounded-lg text-[11px] text-content-muted flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                <span>Demo data stays in this browser and is not sent anywhere.</span>
              </div>
            </Card.Body>
          </Card>

          {/* Section 2: Fulfillment & Meetup Arrangement */}
          <Card padding={true} className="space-y-4">
            <Card.Header>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-blue" />
                <Card.Title>2. Proposed Campus Meetup Arrangement</Card.Title>
              </div>
              <Card.Description>
                Select a proposed secure handover spot on campus grounds.
              </Card.Description>
            </Card.Header>

            <Card.Body className="space-y-4">
              <div className="space-y-2 text-xs">
                <label className="font-semibold text-content-heading block">
                  Select Proposed Campus Location:
                </label>
                <div className="space-y-2">
                  {CAMPUS_MEETUP_SPOTS.map((spot) => (
                    <label
                      key={spot}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        formData.meetupLocation === spot
                          ? 'border-brand-blue bg-blue-50/60 font-semibold text-brand-dark'
                          : 'border-surface-border bg-white text-content-body hover:bg-surface-bg'
                      }`}
                    >
                      <input
                        type="radio"
                        name="meetup-spot"
                        value={spot}
                        checked={formData.meetupLocation === spot}
                        onChange={() => handleChange('meetupLocation', spot)}
                        className="text-brand-blue focus:ring-brand-blue"
                      />
                      <span className="flex-1">{spot}</span>
                    </label>
                  ))}

                  {/* Custom Location Option */}
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.meetupLocation === 'Other'
                        ? 'border-brand-blue bg-blue-50/60 font-semibold text-brand-dark'
                        : 'border-surface-border bg-white text-content-body hover:bg-surface-bg'
                    }`}
                  >
                    <input
                      type="radio"
                      name="meetup-spot"
                      value="Other"
                      checked={formData.meetupLocation === 'Other'}
                      onChange={() => handleChange('meetupLocation', 'Other')}
                      className="text-brand-blue focus:ring-brand-blue"
                    />
                    <span className="flex-1">Other Mutually Agreed Campus Spot</span>
                  </label>

                  {formData.meetupLocation === 'Other' && (
                    <div className="pl-6 pt-1">
                      <input
                        type="text"
                        value={formData.customLocation}
                        onChange={(e) => handleChange('customLocation', e.target.value)}
                        placeholder="Specify campus location (e.g. Room 304 Hallway)"
                        className="form-input text-xs"
                      />
                      {errors.customLocation && (
                        <p className="text-[11px] text-status-danger mt-1">{errors.customLocation}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Meetup Schedule */}
              <div className="space-y-1.5 text-xs pt-2">
                <label className="font-semibold text-content-heading block">
                  Preferred Campus Time Window:
                </label>
                <select
                  value={formData.meetupSchedule}
                  onChange={(e) => handleChange('meetupSchedule', e.target.value)}
                  className="form-input text-xs"
                >
                  {MEETUP_TIME_WINDOWS.map((window) => (
                    <option key={window} value={window}>
                      {window}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Notes */}
              <div className="space-y-1.5 text-xs pt-2">
                <label className="font-semibold text-content-heading block">
                  Order Notes / Instructions for Seller (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="e.g. I will wear an NPC green jacket, please bring exact change."
                  className="form-input text-xs resize-none"
                />
              </div>

              <p className="text-[11px] text-content-muted italic">
                * Note: All campus locations are proposed and subject to official NPC administrative approval.
              </p>
            </Card.Body>
          </Card>

          {/* Section 3: Payment Arrangement */}
          <Card padding={true} className="space-y-4">
            <Card.Header>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-brand-blue" />
                <Card.Title>3. Demonstration Payment Arrangement</Card.Title>
              </div>
              <Card.Description>
                Simulated peer-to-peer payment method upon in-person campus handover.
              </Card.Description>
            </Card.Header>

            <Card.Body className="space-y-3">
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  formData.paymentMethod === 'Cash on Campus Meetup'
                    ? 'border-brand-blue bg-blue-50/60 font-semibold text-brand-dark'
                    : 'border-surface-border bg-white text-content-body hover:bg-surface-bg'
                }`}
              >
                <input
                  type="radio"
                  name="payment-method"
                  value="Cash on Campus Meetup"
                  checked={formData.paymentMethod === 'Cash on Campus Meetup'}
                  onChange={() => handleChange('paymentMethod', 'Cash on Campus Meetup')}
                  className="text-brand-blue focus:ring-brand-blue mt-0.5"
                />
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-content-heading flex items-center gap-1.5">
                    <span>💵 Cash upon Campus Meetup</span>
                    <Badge variant="primary" size="sm">Recommended</Badge>
                  </div>
                  <p className="text-[11px] text-content-muted font-normal">
                    Inspect the item physically and hand cash directly to the student seller upon agreement.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  formData.paymentMethod === 'GCash upon Campus Meetup'
                    ? 'border-brand-blue bg-blue-50/60 font-semibold text-brand-dark'
                    : 'border-surface-border bg-white text-content-body hover:bg-surface-bg'
                }`}
              >
                <input
                  type="radio"
                  name="payment-method"
                  value="GCash upon Campus Meetup"
                  checked={formData.paymentMethod === 'GCash upon Campus Meetup'}
                  onChange={() => handleChange('paymentMethod', 'GCash upon Campus Meetup')}
                  className="text-brand-blue focus:ring-brand-blue mt-0.5"
                />
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-content-heading">
                    📱 GCash upon Campus Meetup (Peer-to-Peer)
                  </div>
                  <p className="text-[11px] text-content-muted font-normal">
                    Arrange QR code / mobile transfer in person upon inspecting the product. No transaction fees.
                  </p>
                </div>
              </label>
            </Card.Body>
          </Card>
        </div>

        {/* Right Column: Order Summary & Submission (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-surface-border rounded-2xl p-6 space-y-5 shadow-xs sticky top-20">
            <h3 className="text-sm font-bold uppercase tracking-wider text-content-heading pb-3 border-b border-surface-border">
              Order Review ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </h3>

            {/* Items Mini List */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 divide-y divide-surface-border">
              {cartItems.map((item) => (
                <div key={item.product.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-surface-border shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-content-heading truncate leading-tight">
                        {item.product.title}
                      </p>
                      <p className="text-[10px] text-content-muted">
                        Qty: <strong>{item.quantity}</strong> × {formatPHP(item.product.price)}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-content-heading shrink-0">
                    {formatPHP(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Subtotal & Calculations */}
            <div className="space-y-2.5 pt-3 border-t border-surface-border text-xs">
              <div className="flex items-center justify-between text-content-body">
                <span>Items Subtotal</span>
                <span className="font-semibold text-content-heading">{formatPHP(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-content-body">
                <span>Campus Platform Fee</span>
                <span className="font-semibold text-status-success">₱0.00 (Proposed Demo Platform Fee)</span>
              </div>
              <div className="pt-3 border-t border-surface-border flex items-baseline justify-between">
                <span className="text-sm font-bold text-content-heading">Total Due at Meetup</span>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-content-heading">
                    {formatPHP(subtotal)}
                  </span>
                  <p className="text-[10px] text-content-muted">Philippine Pesos (PHP)</p>
                </div>
              </div>
            </div>

            {/* Submission CTA */}
            <div className="pt-2 space-y-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                rightIcon={CheckCircle2}
                className="w-full shadow-md"
              >
                Submit Demonstration Order
              </Button>

              <Link to="/cart" className="block text-center">
                <span className="text-xs text-content-muted hover:text-brand-blue transition-colors">
                  &larr; Return to edit cart items
                </span>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
