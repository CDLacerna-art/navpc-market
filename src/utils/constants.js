/**
 * NavPC Market Constants
 * Centralized configuration for categories, product conditions, order statuses, and campus meetup locations.
 */

export const APP_NAME = 'NavPC Market';
export const APP_TAGLINE = 'Your Campus. Your Marketplace.';
export const INSTITUTION_NAME = 'Navotas Polytechnic College';
export const CAMPUS_CODE = 'NPC';

export const USER_ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin',
};

export const PRODUCT_CATEGORIES = [
  { id: 'cat-supplies', name: 'School Supplies', slug: 'school-supplies', icon: 'BookOpen', description: 'Notebooks, pens, drafting tools, binders, calculators' },
  { id: 'cat-food', name: 'Food and Beverages', slug: 'food-beverages', icon: 'Utensils', description: 'Homemade snacks, baked treats, lunch bento, coffee, juices' },
  { id: 'cat-clothing', name: 'Clothing and Accessories', slug: 'clothing-accessories', icon: 'Shirt', description: 'NPC uniforms, lanyards, tote bags, casual wear, pins' },
  { id: 'cat-electronics', name: 'Electronics', slug: 'electronics', icon: 'Laptop', description: 'Flash drives, chargers, keyboards, peripherals, gadgets' },
  { id: 'cat-services', name: 'Digital Services', slug: 'digital-services', icon: 'Sparkles', description: 'Printing, graphic design, layout, thesis binding, tutoring' },
  { id: 'cat-others', name: 'Others', slug: 'others', icon: 'MoreHorizontal', description: 'Dorm essentials, personal items, sports gear, general goods' },
];

export const PRODUCT_CONDITIONS = [
  'Brand New',
  'Like New',
  'Pre-loved',
  'Digital / Service',
];

// Proposed campus meetup locations (subject to official NPC school approval)
export const CAMPUS_MEETUP_SPOTS = [
  'NPC Main Building Lobby (Proposed Zone)',
  'Student Activity Center (SAC) (Proposed Zone)',
  'College Library Entrance (Proposed Zone)',
  'NPC Campus Canteen Ground Floor (Proposed Zone)',
  'Covered Court Bleachers (Proposed Zone)',
  'NPC Information Desk (Proposed Zone)',
];

export const ORDER_STATUSES = {
  PENDING: { label: 'Pending Seller Confirmation', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  CONFIRMED: { label: 'Confirmed & Preparing', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  READY: { label: 'Ready for Campus Meetup', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  COMPLETED: { label: 'Completed Meetup', color: 'bg-green-100 text-green-800 border-green-200' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200' },
};
