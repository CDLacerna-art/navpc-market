import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { formatPHP } from '../../utils/currency';
import { ORDER_STATUSES } from '../../utils/constants';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import {
  CheckCircle2,
  MapPin,
  Clock,
  User,
  ShoppingBag,
  ArrowRight,
  Printer,
  ShieldCheck,
  AlertTriangle,
  Info,
  DollarSign
} from 'lucide-react';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const foundOrder = orderService.getDemoOrder(orderId);
    setOrder(foundOrder);
    setLoading(false);
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-sm text-content-muted">Loading demonstration order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-status-warning flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-content-heading">Demonstration Order Not Found</h2>
        <p className="text-xs sm:text-sm text-content-muted">
          We could not locate demonstration order with ID: <code className="bg-gray-100 px-1 rounded">{orderId}</code>.
        </p>
        <div className="pt-2">
          <Link to="/marketplace">
            <Button variant="primary">Return to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* =========================================================================
          SUCCESS BANNER & CONFIRMATION HEADER
         ========================================================================= */}
      <div className="bg-white border border-surface-border rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-card">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-status-success flex items-center justify-center ring-8 ring-emerald-50/50">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-1">
          <Badge variant="primary" size="md">
            Academic Demonstration Order
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-heading tracking-tight">
            Demonstration Order Registered!
          </h1>
          <p className="text-xs sm:text-sm text-content-muted max-w-lg mx-auto">
            Your simulated campus order has been created for academic evaluation. In a full release, the student seller would receive a notification to confirm the meetup.
          </p>
        </div>

        {/* Demo Order Number Strip */}
        <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-surface-bg border border-surface-border px-5 py-2.5 rounded-xl text-xs">
          <span className="text-content-muted">Demonstration Order Number:</span>
          <strong className="font-mono text-sm text-brand-blue font-bold tracking-wider">
            {order.orderNumber}
          </strong>
          <span className="text-content-subtle">•</span>
          <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            Status: {order.status}
          </span>
        </div>
      </div>

      {/* Technopreneurship Academic Compliance Notice */}
      <div className="p-4 bg-blue-50/80 border border-blue-200/90 rounded-2xl flex items-start gap-3.5 text-xs text-blue-900 shadow-xs">
        <Info className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-blue-950">
            Fictional Demonstration Transaction
          </p>
          <p className="leading-relaxed">
            This receipt represents an academic prototype simulation for the NPC Technopreneurship curriculum. No real funds have been charged and no actual physical goods will be transferred.
          </p>
        </div>
      </div>

      {/* =========================================================================
          ORDER DETAILS SUMMARY
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Fulfillment & Meetup Arrangement */}
        <Card padding={true} className="space-y-4">
          <Card.Header>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-blue" />
              <Card.Title>Proposed Fulfillment & Meetup</Card.Title>
            </div>
            <Card.Description>Campus meetup details agreed for handover.</Card.Description>
          </Card.Header>

          <Card.Body className="space-y-3 text-xs">
            <div className="space-y-1">
              <span className="text-content-muted block">Proposed Campus Location:</span>
              <p className="font-semibold text-content-heading text-sm">
                {order.meetupLocation}
              </p>
              <p className="text-[11px] text-content-subtle italic">
                * Location proposed and subject to official NPC school administration approval.
              </p>
            </div>

            <div className="space-y-1 pt-2 border-t border-surface-border">
              <span className="text-content-muted block">Preferred Schedule Window:</span>
              <div className="flex items-center gap-1.5 font-medium text-content-heading">
                <Clock className="w-3.5 h-3.5 text-brand-blue" />
                <span>{order.meetupSchedule}</span>
              </div>
            </div>

            <div className="space-y-1 pt-2 border-t border-surface-border">
              <span className="text-content-muted block">Payment Method:</span>
              <div className="flex items-center gap-1.5 font-semibold text-content-heading">
                <DollarSign className="w-3.5 h-3.5 text-status-success" />
                <span>{order.paymentMethod}</span>
              </div>
            </div>

            {order.notes && (
              <div className="space-y-1 pt-2 border-t border-surface-border">
                <span className="text-content-muted block">Buyer Instructions / Notes:</span>
                <p className="italic text-content-body bg-surface-bg p-2 rounded-lg">
                  "{order.notes}"
                </p>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Card 2: Student Buyer Information */}
        <Card padding={true} className="space-y-4">
          <Card.Header>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-brand-blue" />
              <Card.Title>Student Buyer Profile</Card.Title>
            </div>
            <Card.Description>Demonstration contact credentials.</Card.Description>
          </Card.Header>

          <Card.Body className="space-y-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-content-muted block">Buyer Name:</span>
              <p className="font-semibold text-content-heading">{order.buyer.fullName}</p>
            </div>

            <div className="space-y-0.5 pt-2 border-t border-surface-border">
              <span className="text-content-muted block">Student ID Number:</span>
              <p className="font-semibold text-content-heading">{order.buyer.studentId}</p>
            </div>

            <div className="space-y-0.5 pt-2 border-t border-surface-border">
              <span className="text-content-muted block">Mobile Contact Number:</span>
              <p className="font-semibold text-content-heading">{order.buyer.contactNumber}</p>
            </div>

            <div className="space-y-0.5 pt-2 border-t border-surface-border">
              <span className="text-content-muted block">Student Email:</span>
              <p className="font-semibold text-content-heading">{order.buyer.email}</p>
            </div>

            <div className="space-y-0.5 pt-2 border-t border-surface-border">
              <span className="text-content-muted block">Order Created At:</span>
              <p className="font-medium text-content-heading">
                {new Date(order.createdAt).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Card 3: Items Ordered Table */}
      <Card padding={true} className="space-y-4">
        <Card.Header>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-brand-blue" />
            <Card.Title>Items Ordered ({order.items.length})</Card.Title>
          </div>
        </Card.Header>

        <Card.Body>
          <div className="divide-y divide-surface-border">
            {order.items.map((item) => (
              <div key={item.id} className="py-3.5 first:pt-0 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/products/scientific-calculator.jpg';
                    }}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-surface-border shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-content-heading truncate leading-snug">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-content-muted">
                      Seller: <strong>{item.seller.name}</strong> <span className="text-brand-blue">(Demo Seller)</span>
                    </p>
                    <p className="text-[10px] text-content-subtle">
                      {item.condition} • Qty: <strong>{item.quantity}</strong> × {formatPHP(item.price)}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-extrabold text-content-heading">
                    {formatPHP(item.subtotal)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-surface-border flex items-baseline justify-between text-sm">
            <span className="font-bold text-content-heading">Total Amount Due at Meetup:</span>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-brand-blue">
                {formatPHP(order.totalAmount)}
              </span>
              <p className="text-[10px] text-content-muted">Philippine Pesos</p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <Button
          variant="secondary"
          size="md"
          onClick={handlePrint}
          leftIcon={Printer}
          className="w-full sm:w-auto"
        >
          Print / Save Confirmation
        </Button>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link to="/marketplace" className="w-full sm:w-auto">
            <Button variant="primary" size="md" rightIcon={ArrowRight} className="w-full">
              Explore More Campus Items
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
