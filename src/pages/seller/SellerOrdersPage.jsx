import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { formatPHP } from '../../utils/currency';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import {
  ShoppingBag,
  Info,
  Calendar,
  MapPin,
  Clock,
  User,
  Package,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SellerOrdersPage() {
  const [demoOrders, setDemoOrders] = useState([]);

  useEffect(() => {
    // Read local demonstration orders from Phase 4 evaluation
    const stored = orderService.getAllDemoOrders();
    setDemoOrders(stored);
  }, []);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" size="sm">Phase 7 Preview</Badge>
            <span className="text-xs text-content-muted">Campus Meetup Orders</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-content-heading mt-1">
            Student Orders & Meetup Dispatch
          </h1>
          <p className="text-xs text-content-muted">
            Incoming buyer orders and campus meetup coordination.
          </p>
        </div>
      </div>

      {/* DISCLOSURE CARD */}
      <Card padding={true} className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border-blue-200">
        <div className="flex items-start space-x-3.5">
          <div className="w-9 h-9 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold text-content-heading">
                Honest Architectural Notice: Phase 7 Order Settlement
              </h3>
              <Badge variant="primary" size="xs">Academic Disclosure</Badge>
            </div>
            <p className="text-xs text-content-body leading-relaxed">
              NavPC Market Phase 6 establishes product listings, Supabase image storage, and inventory controls. Checkout orders placed during Phase 4 are simulated browser evaluation records stored strictly in local evaluation storage. Real buyer-to-seller order integration, dispatch confirmation, and database settlement will be delivered in <strong>Phase 7</strong>. Demo orders are never silently migrated into real production records.
            </p>
          </div>
        </div>
      </Card>

      {/* LOCAL EVALUATION ORDERS DISPLAY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-content-heading">
            Browser Evaluation Orders ({demoOrders.length})
          </h3>
          <span className="text-[11px] text-content-muted">
            Origin: LocalStorage evaluation flow
          </span>
        </div>

        {demoOrders.length === 0 ? (
          <Card padding={true} className="text-center py-16 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-content-muted">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-content-heading">No Evaluation Orders In Browser</h4>
            <p className="text-xs text-content-muted max-w-md mx-auto">
              You haven't submitted any demonstration orders in this browser yet. To test the simulated checkout flow, add items to cart from the marketplace and complete checkout.
            </p>
            <Link to="/marketplace">
              <Button variant="secondary" size="sm">
                Explore Marketplace
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {demoOrders.map((order) => (
              <Card key={order.id} padding={true} className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-ui-border gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-xs font-bold text-brand-blue">
                      {order.orderNumber}
                    </span>
                    <Badge variant="warning" size="xs">
                      Demo Evaluation
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-content-muted">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </span>
                    <span className="font-bold text-content-heading">
                      {formatPHP(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* BUYER & MEETUP DETAILS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg">
                  <div>
                    <span className="text-[10px] text-content-muted uppercase font-bold block">Buyer Information</span>
                    <p className="font-semibold text-content-heading mt-0.5">{order.buyer?.fullName || 'Student Buyer'}</p>
                    <p className="text-[11px] text-content-muted">{order.buyer?.email || 'N/A'}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-content-muted uppercase font-bold block">Proposed Meetup Spot</span>
                    <p className="font-semibold text-content-heading mt-0.5 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                      <span className="truncate">{order.meetupLocation}</span>
                    </p>
                  </div>
                </div>

                {/* ITEMS */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-content-muted uppercase font-bold block">Ordered Items</span>
                  <div className="divide-y divide-ui-border/60">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                        <span className="text-content-heading font-medium">
                          {item.title} <span className="text-content-muted">× {item.quantity}</span>
                        </span>
                        <span className="font-bold text-content-heading">
                          {formatPHP(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
