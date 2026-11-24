/**
 * NavPC Market — Isolated Demo Order Service
 * 
 * Stores simulated demonstration orders in localStorage ('navpc_demo_orders').
 * Strictly decoupled from Supabase to provide an evaluation flow
 * for Technopreneurship academic demonstrations.
 */

import { ALL_PRODUCTS } from '../utils/demoData';

const STORAGE_KEY_ORDERS = 'navpc_demo_orders';

export const orderService = {
  getAllDemoOrders() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ORDERS);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Failed to read demo orders:', e);
      return [];
    }
  },

  getDemoOrder(orderId) {
    const orders = this.getAllDemoOrders();
    return orders.find((o) => o.id === orderId) || null;
  },

  createDemoOrder({ buyer, items, paymentMethod, meetupLocation, meetupSchedule, notes }) {
    const orders = this.getAllDemoOrders();
    const orderNumber = `DEMO-NPC-${new Date().getFullYear()}-${String(orders.length + 1).padStart(4, '0')}`;
    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Recalculate prices and subtotals strictly from catalog (never trust client cart prices)
    const verifiedItems = items.map((item) => {
      const catalogProduct = ALL_PRODUCTS.find((p) => p.id === item.product.id) || item.product;
      const verifiedUnitPrice = catalogProduct.price;
      const verifiedSubtotal = verifiedUnitPrice * item.quantity;

      return {
        id: catalogProduct.id,
        title: catalogProduct.title,
        price: verifiedUnitPrice,
        quantity: item.quantity,
        subtotal: verifiedSubtotal,
        image: catalogProduct.image,
        category: catalogProduct.category,
        condition: catalogProduct.condition,
        seller: {
          name: catalogProduct.seller.name,
          program: catalogProduct.seller.program,
        },
      };
    });

    const verifiedTotalAmount = verifiedItems.reduce((acc, it) => acc + it.subtotal, 0);

    const newOrder = {
      id: orderId,
      orderNumber,
      buyer: {
        fullName: buyer.fullName,
        contactNumber: buyer.contactNumber,
        email: buyer.email || 'N/A',
        studentId: buyer.studentId || 'N/A',
        collegeProgram: buyer.collegeProgram || 'N/A',
      },
      items: verifiedItems,
      totalAmount: verifiedTotalAmount,
      paymentMethod,
      meetupLocation,
      meetupSchedule: meetupSchedule || 'Mutual Agreement upon Meetup',
      notes: notes || '',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      isDemoOrder: true,
      complianceNote: 'Simulated demonstration order for NPC Technopreneurship academic evaluation. No real payment or delivery occurs.',
    };

    orders.unshift(newOrder);

    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed to save demo order to storage:', e);
    }

    return newOrder;
  },
};
