import crypto from 'node:crypto';

export type OrderStatus =
  | 'Pending'
  | 'Accepted'
  | 'Preparing'
  | 'Ready for Pickup'
  | 'Completed'
  | 'Cancelled';

export type Role = 'student' | 'admin';

export interface Profile {
  id: string;
  email: string;
  password?: string;
  full_name: string;
  student_id: string | null;
  phone: string | null;
  role: Role;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category_id: string;
  category: string;
  price: number;
  image_url: string;
  is_available: boolean;
  is_vegetarian: boolean | null;
  preparation_time_minutes: number;
  is_featured: boolean;
}

export interface OrderItemLine {
  id?: string;
  menu_item_id: string;
  item_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderHistoryEntry {
  old_status: string | null;
  new_status: string;
  changed_by: string;
  created_at: string;
}

export interface OrderRecord {
  id: string;
  token_number: string;
  student_id: string;
  student_name: string;
  student_code?: string | null;
  phone?: string | null;
  status: OrderStatus;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  pickup_slot: string | null;
  campus_location?: string | null;
  order_notes?: string | null;
  estimated_ready_at: string;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItemLine[];
  history: OrderHistoryEntry[];
}

export const CAMPUS_LOCATIONS = [
  'Main Canteen Counter',
  'Hostel Block A (Boys)',
  'Hostel Block B (Girls)',
  'Academic Complex - Block 1',
  'Academic Complex - Block 2',
  'Central University Library',
  'Student Innovation & Tech Center',
] as const;

export type CampusLocation = (typeof CAMPUS_LOCATIONS)[number] | string;

export function validateCheckoutDetails(details: {
  customerName?: string;
  phone?: string;
  campusLocation?: string;
  orderNotes?: string;
}): { valid: boolean; error?: string } {
  const name = String(details.customerName || '').trim();
  if (!name) {
    return { valid: false, error: 'Customer name is required' };
  }
  if (name.length > 80) {
    return { valid: false, error: 'Customer name is too long (maximum 80 characters)' };
  }

  const phone = String(details.phone || '').trim();
  if (!phone) {
    return { valid: false, error: 'Contact phone number is required' };
  }
  // Allow international and local campus phone formats (+91..., 10 digits, dashes, spaces)
  const phoneClean = phone.replace(/[\s\-\(\)\+]/g, '');
  if (phoneClean.length < 8 || phoneClean.length > 15 || !/^\d+$/.test(phoneClean)) {
    return { valid: false, error: 'Please enter a valid phone number (8-15 digits)' };
  }

  const notes = String(details.orderNotes || '').trim();
  if (notes.length > 300) {
    return { valid: false, error: 'Order notes must be under 300 characters' };
  }

  return { valid: true };
}

export function reorderItemsFromOrder(
  order: OrderRecord,
  menuMap: Map<string, MenuItem>
): {
  availableItems: Array<{ id: string; name: string; price: number; qty: number; image_url: string; category: string }>;
  unavailableItemNames: string[];
} {
  const availableItems: Array<{ id: string; name: string; price: number; qty: number; image_url: string; category: string }> = [];
  const unavailableItemNames: string[] = [];

  for (const item of order.items) {
    const current = menuMap.get(item.menu_item_id);
    if (current && current.is_available) {
      availableItems.push({
        id: current.id,
        name: current.name,
        price: current.price,
        qty: Math.max(1, Math.min(30, item.quantity)),
        image_url: current.image_url,
        category: current.category,
      });
    } else {
      unavailableItemNames.push(item.item_name);
    }
  }

  return { availableItems, unavailableItemNames };
}

export interface NotificationRecord {
  id: string;
  user_id: string;
  order_id: string | null;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Pending: ['Accepted', 'Cancelled'],
  Accepted: ['Preparing', 'Cancelled'],
  Preparing: ['Ready for Pickup', 'Cancelled'],
  'Ready for Pickup': ['Completed'],
  Completed: [],
  Cancelled: [],
};

export function isValidStatusTransition(from: OrderStatus, to: OrderStatus): boolean {
  return (ALLOWED_STATUS_TRANSITIONS[from] || []).includes(to);
}

export function canStudentCancel(status: OrderStatus): boolean {
  return status === 'Pending' || status === 'Accepted';
}

export function formatMoney(n: number | string | null | undefined): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(n || 0));
}

export function statusClass(s: string | null | undefined): string {
  return String(s || 'pending')
    .toLowerCase()
    .replaceAll(' ', '-');
}

export function generatePickupToken(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const suffix = crypto.randomUUID().replace(/-/g, '').substring(0, 6).toUpperCase();
  return `SC-${y}${m}${d}-${suffix}`;
}

export function calculateOrderTotals(
  cartLines: Array<{ menuItemId: string; quantity: number }>,
  menuMap: Map<string, MenuItem>
): {
  totalAmount: number;
  maxPrepMinutes: number;
  items: OrderItemLine[];
} {
  if (!cartLines.length) {
    throw new Error('Order must contain at least one item');
  }
  if (cartLines.length > 30) {
    throw new Error('Too many different items');
  }

  const merged = new Map<string, number>();
  for (const line of cartLines) {
    if (!line.menuItemId || line.quantity < 1 || line.quantity > 30) {
      throw new Error('Invalid item quantity (must be between 1 and 30)');
    }
    merged.set(line.menuItemId, (merged.get(line.menuItemId) || 0) + line.quantity);
  }

  let totalAmount = 0;
  let maxPrepMinutes = 10;
  const items: OrderItemLine[] = [];

  for (const [menuId, qty] of merged.entries()) {
    const item = menuMap.get(menuId);
    if (!item) {
      throw new Error('A menu item no longer exists');
    }
    if (!item.is_available) {
      throw new Error(`${item.name} is sold out`);
    }
    const subtotal = Number((item.price * qty).toFixed(2));
    totalAmount = Number((totalAmount + subtotal).toFixed(2));
    if (item.preparation_time_minutes > maxPrepMinutes) {
      maxPrepMinutes = item.preparation_time_minutes;
    }
    items.push({
      menu_item_id: item.id,
      item_name: item.name,
      unit_price: item.price,
      quantity: qty,
      subtotal,
    });
  }

  return { totalAmount, maxPrepMinutes, items };
}

export function createFoodSvgDataUri(title: string, accentColor: string, bgStart: string, bgEnd: string, emoji: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgStart}"/>
        <stop offset="100%" stop-color="${bgEnd}"/>
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#g)"/>
    <circle cx="650" cy="120" r="180" fill="${accentColor}" opacity="0.12"/>
    <circle cx="140" cy="480" r="210" fill="${accentColor}" opacity="0.1"/>
    <circle cx="400" cy="260" r="125" fill="#ffffff" opacity="0.92"/>
    <text x="400" y="295" font-size="105" text-anchor="middle">${emoji}</text>
    <text x="400" y="455" font-family="sans-serif" font-size="34" font-weight="bold" fill="#17243a" text-anchor="middle">${title}</text>
    <text x="400" y="495" font-family="sans-serif" font-size="18" font-weight="600" fill="#647187" text-anchor="middle">CAMPUSBITE FRESH KITCHEN</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
