import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  type Profile,
  type Category,
  type MenuItem,
  type OrderRecord,
  type OrderStatus,
  type NotificationRecord,
  isValidStatusTransition,
  canStudentCancel,
  calculateOrderTotals,
  generatePickupToken,
  createFoodSvgDataUri,
  validateCheckoutDetails,
  reorderItemsFromOrder,
  CAMPUS_LOCATIONS,
} from './src/utils/canteenRules';

const app = express();
app.use(express.json({ limit: '10mb' }));

// Debounce tracker to prevent rapid duplicate orders
const lastOrderTimeByUser = new Map<string, number>();

// Seed Categories
const categories: Category[] = [
  { id: 'cat-breakfast', name: 'Breakfast', description: 'Fresh morning favourites' },
  { id: 'cat-meals', name: 'Meals', description: 'Filling campus meals' },
  { id: 'cat-snacks', name: 'Snacks', description: 'Quick bites between classes' },
  { id: 'cat-fastfood', name: 'Fast Food', description: 'Campus classics' },
  { id: 'cat-beverages', name: 'Beverages', description: 'Cold and hot drinks' },
  { id: 'cat-desserts', name: 'Desserts', description: 'A sweet finish' },
];

// Seed Menu Items with resilient SVG illustrations
const menuItems: MenuItem[] = [
  {
    id: 'item-masala-dosa',
    name: 'Masala Dosa',
    description: 'Crispy dosa with spiced potato masala, coconut chutney, and piping hot sambar',
    category_id: 'cat-breakfast',
    category: 'Breakfast',
    price: 55.0,
    image_url: createFoodSvgDataUri('Masala Dosa', '#e69b24', '#fff8eb', '#fde6c4', '🥞'),
    is_available: true,
    is_vegetarian: true,
    preparation_time_minutes: 12,
    is_featured: true,
  },
  {
    id: 'item-idli-sambar',
    name: 'Idli Sambar',
    description: 'Steamed fluffy rice idlis served with aromatic lentil sambar and chutneys',
    category_id: 'cat-breakfast',
    category: 'Breakfast',
    price: 35.0,
    image_url: createFoodSvgDataUri('Idli Sambar', '#16835d', '#f0fdf4', '#dcfce7', '🥣'),
    is_available: true,
    is_vegetarian: true,
    preparation_time_minutes: 8,
    is_featured: false,
  },
  {
    id: 'item-veg-meals',
    name: 'Veg Meals',
    description: 'Steamed rice, seasonal vegetable curry, dal tadka, rasam, curd, and crisp papad',
    category_id: 'cat-meals',
    category: 'Meals',
    price: 90.0,
    image_url: createFoodSvgDataUri('Campus Veg Thali', '#1458d4', '#eff6ff', '#dbeafe', '🍛'),
    is_available: true,
    is_vegetarian: true,
    preparation_time_minutes: 15,
    is_featured: true,
  },
  {
    id: 'item-paneer-wrap',
    name: 'Paneer Tikka Wrap',
    description: 'Char-grilled spiced paneer cubes, crunchy onions, and mint mayo in a warm flatbread wrap',
    category_id: 'cat-fastfood',
    category: 'Fast Food',
    price: 85.0,
    image_url: createFoodSvgDataUri('Paneer Tikka Wrap', '#df7628', '#fff7ed', '#ffedd5', '🌯'),
    is_available: true,
    is_vegetarian: true,
    preparation_time_minutes: 10,
    is_featured: true,
  },
  {
    id: 'item-veg-puff',
    name: 'Crispy Veg Puff',
    description: 'Golden flaky bakery pastry filled with spiced green peas and potato masala',
    category_id: 'cat-snacks',
    category: 'Snacks',
    price: 25.0,
    image_url: createFoodSvgDataUri('Crispy Veg Puff', '#d97706', '#fefce8', '#fef08a', '🥐'),
    is_available: true,
    is_vegetarian: true,
    preparation_time_minutes: 5,
    is_featured: false,
  },
  {
    id: 'item-cold-coffee',
    name: 'Signature Cold Coffee',
    description: 'Chilled creamy espresso blended with rich milk and cocoa dust',
    category_id: 'cat-beverages',
    category: 'Beverages',
    price: 50.0,
    image_url: createFoodSvgDataUri('Cold Coffee', '#4f46e5', '#eef2ff', '#e0e7ff', '🧋'),
    is_available: true,
    is_vegetarian: true,
    preparation_time_minutes: 4,
    is_featured: true,
  },
  {
    id: 'item-brownie',
    name: 'Fudge Walnut Brownie',
    description: 'Warm dark chocolate brownie square with roasted walnuts',
    category_id: 'cat-desserts',
    category: 'Desserts',
    price: 45.0,
    image_url: createFoodSvgDataUri('Fudge Brownie', '#9333ea', '#faf5ff', '#f3e8ff', '🍫'),
    is_available: true,
    is_vegetarian: true,
    preparation_time_minutes: 3,
    is_featured: false,
  },
  {
    id: 'item-masala-chai',
    name: 'Cardamom Masala Chai',
    description: 'Freshly brewed Assam tea infused with crushed cardamom and ginger',
    category_id: 'cat-beverages',
    category: 'Beverages',
    price: 20.0,
    image_url: createFoodSvgDataUri('Masala Chai', '#b45309', '#fffbeb', '#fde68a', '☕'),
    is_available: true,
    is_vegetarian: true,
    preparation_time_minutes: 4,
    is_featured: false,
  },
];

// Seed Users / Profiles
const STUDENT_ID = '11111111-1111-4111-8111-111111111111';
const STUDENT_2_ID = '22222222-2222-4222-8222-222222222222';
const ADMIN_ID = '99999999-9999-4999-8999-999999999999';

const profiles = new Map<string, Profile>([
  [
    STUDENT_ID,
    {
      id: STUDENT_ID,
      email: 'student@campus.edu',
      password: 'password123',
      full_name: 'Aarav Sharma',
      student_id: '22CSE104',
      phone: '+91 98765 43210',
      role: 'student',
      created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    },
  ],
  [
    STUDENT_2_ID,
    {
      id: STUDENT_2_ID,
      email: 'priya@campus.edu',
      password: 'password123',
      full_name: 'Priya Nair',
      student_id: '23ECE088',
      phone: '+91 98111 22334',
      role: 'student',
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
  ],
  [
    ADMIN_ID,
    {
      id: ADMIN_ID,
      email: 'admin@campus.edu',
      password: 'admin123',
      full_name: 'Rajesh Menon (Canteen Manager)',
      student_id: null,
      phone: '+91 98000 11223',
      role: 'admin',
      created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
    },
  ],
]);

// Token -> User ID mapping
const tokenStore = new Map<string, string>([
  ['demo-student-token', STUDENT_ID],
  ['demo-admin-token', ADMIN_ID],
]);

const now = Date.now();
const todayIso = (offsetMinutes: number) => new Date(now + offsetMinutes * 60000).toISOString();

// Seed initial realistic orders
const orders: OrderRecord[] = [
  {
    id: 'ord-1001',
    token_number: 'SC-0248',
    student_id: STUDENT_ID,
    student_name: 'Aarav Sharma',
    student_code: '22CSE104',
    phone: '+91 98765 43210',
    status: 'Preparing',
    total_amount: 105.0,
    payment_method: 'Pay at Counter',
    payment_status: 'unpaid',
    pickup_slot: todayIso(15),
    estimated_ready_at: todayIso(8),
    cancellation_reason: null,
    created_at: todayIso(-12),
    updated_at: todayIso(-4),
    items: [
      {
        menu_item_id: 'item-masala-dosa',
        item_name: 'Masala Dosa',
        unit_price: 55.0,
        quantity: 1,
        subtotal: 55.0,
      },
      {
        menu_item_id: 'item-cold-coffee',
        item_name: 'Signature Cold Coffee',
        unit_price: 50.0,
        quantity: 1,
        subtotal: 50.0,
      },
    ],
    history: [
      { old_status: null, new_status: 'Pending', changed_by: STUDENT_ID, created_at: todayIso(-12) },
      { old_status: 'Pending', new_status: 'Accepted', changed_by: ADMIN_ID, created_at: todayIso(-9) },
      { old_status: 'Accepted', new_status: 'Preparing', changed_by: ADMIN_ID, created_at: todayIso(-4) },
    ],
  },
  {
    id: 'ord-1002',
    token_number: 'SC-0249',
    student_id: STUDENT_2_ID,
    student_name: 'Priya Nair',
    student_code: '23ECE088',
    phone: '+91 98111 22334',
    status: 'Pending',
    total_amount: 110.0,
    payment_method: 'Pay at Counter',
    payment_status: 'unpaid',
    pickup_slot: todayIso(20),
    estimated_ready_at: todayIso(12),
    cancellation_reason: null,
    created_at: todayIso(-3),
    updated_at: todayIso(-3),
    items: [
      {
        menu_item_id: 'item-paneer-wrap',
        item_name: 'Paneer Tikka Wrap',
        unit_price: 85.0,
        quantity: 1,
        subtotal: 85.0,
      },
      {
        menu_item_id: 'item-veg-puff',
        item_name: 'Crispy Veg Puff',
        unit_price: 25.0,
        quantity: 1,
        subtotal: 25.0,
      },
    ],
    history: [
      { old_status: null, new_status: 'Pending', changed_by: STUDENT_2_ID, created_at: todayIso(-3) },
    ],
  },
  {
    id: 'ord-1003',
    token_number: 'SC-0245',
    student_id: STUDENT_ID,
    student_name: 'Aarav Sharma',
    student_code: '22CSE104',
    phone: '+91 98765 43210',
    status: 'Ready for Pickup',
    total_amount: 35.0,
    payment_method: 'Pay at Counter',
    payment_status: 'unpaid',
    pickup_slot: null,
    estimated_ready_at: todayIso(-1),
    cancellation_reason: null,
    created_at: todayIso(-18),
    updated_at: todayIso(-1),
    items: [
      {
        menu_item_id: 'item-idli-sambar',
        item_name: 'Idli Sambar',
        unit_price: 35.0,
        quantity: 1,
        subtotal: 35.0,
      },
    ],
    history: [
      { old_status: null, new_status: 'Pending', changed_by: STUDENT_ID, created_at: todayIso(-18) },
      { old_status: 'Pending', new_status: 'Accepted', changed_by: ADMIN_ID, created_at: todayIso(-15) },
      { old_status: 'Accepted', new_status: 'Preparing', changed_by: ADMIN_ID, created_at: todayIso(-10) },
      { old_status: 'Preparing', new_status: 'Ready for Pickup', changed_by: ADMIN_ID, created_at: todayIso(-1) },
    ],
  },
  {
    id: 'ord-1000',
    token_number: 'SC-0239',
    student_id: STUDENT_ID,
    student_name: 'Aarav Sharma',
    student_code: '22CSE104',
    phone: '+91 98765 43210',
    status: 'Completed',
    total_amount: 135.0,
    payment_method: 'Pay at Counter',
    payment_status: 'paid',
    pickup_slot: null,
    estimated_ready_at: todayIso(-95),
    cancellation_reason: null,
    created_at: todayIso(-110),
    updated_at: todayIso(-90),
    items: [
      {
        menu_item_id: 'item-veg-meals',
        item_name: 'Veg Meals',
        unit_price: 90.0,
        quantity: 1,
        subtotal: 90.0,
      },
      {
        menu_item_id: 'item-brownie',
        item_name: 'Fudge Walnut Brownie',
        unit_price: 45.0,
        quantity: 1,
        subtotal: 45.0,
      },
    ],
    history: [
      { old_status: null, new_status: 'Pending', changed_by: STUDENT_ID, created_at: todayIso(-110) },
      { old_status: 'Pending', new_status: 'Completed', changed_by: ADMIN_ID, created_at: todayIso(-90) },
    ],
  },
  {
    id: 'ord-0999',
    token_number: 'SC-0234',
    student_id: STUDENT_2_ID,
    student_name: 'Priya Nair',
    student_code: '23ECE088',
    phone: '+91 98111 22334',
    status: 'Completed',
    total_amount: 160.0,
    payment_method: 'Pay at Counter',
    payment_status: 'paid',
    pickup_slot: null,
    estimated_ready_at: todayIso(-130),
    cancellation_reason: null,
    created_at: todayIso(-150),
    updated_at: todayIso(-125),
    items: [
      {
        menu_item_id: 'item-masala-dosa',
        item_name: 'Masala Dosa',
        unit_price: 55.0,
        quantity: 2,
        subtotal: 110.0,
      },
      {
        menu_item_id: 'item-cold-coffee',
        item_name: 'Signature Cold Coffee',
        unit_price: 50.0,
        quantity: 1,
        subtotal: 50.0,
      },
    ],
    history: [
      { old_status: null, new_status: 'Pending', changed_by: STUDENT_2_ID, created_at: todayIso(-150) },
      { old_status: 'Pending', new_status: 'Completed', changed_by: ADMIN_ID, created_at: todayIso(-125) },
    ],
  },
];

const notifications: NotificationRecord[] = [
  {
    id: 'notif-1',
    user_id: STUDENT_ID,
    order_id: 'ord-1003',
    title: 'Order Ready for Pickup',
    message: 'Your order SC-0245 (Idli Sambar) is ready. Please collect it at the counter.',
    is_read: false,
    created_at: todayIso(-1),
  },
  {
    id: 'notif-2',
    user_id: STUDENT_ID,
    order_id: 'ord-1001',
    title: 'Order Preparing',
    message: 'Your food for token SC-0248 is now being prepared in the kitchen.',
    is_read: false,
    created_at: todayIso(-4),
  },
];

function getAuthProfile(req: express.Request): Profile {
  const auth = req.headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  const userId = tokenStore.get(token) || token;
  const profile = profiles.get(userId);
  if (!profile) {
    const err = new Error('Invalid or expired user session. Please sign in.');
    (err as any).status = 401;
    throw err;
  }
  return profile;
}

function requireAdmin(req: express.Request): Profile {
  const profile = getAuthProfile(req);
  if (profile.role !== 'admin') {
    const err = new Error('Admin access required');
    (err as any).status = 403;
    throw err;
  }
  return profile;
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'smart-canteen-api' });
});

// Auth endpoints
app.post('/api/auth/signup', (req, res) => {
  const { email, password, fullName, studentId } = req.body || {};
  if (!email || !password || String(password).length < 6) {
    res.status(400).json({ message: 'Valid email and password (min 6 chars) are required' });
    return;
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  for (const p of profiles.values()) {
    if (p.email.toLowerCase() === normalizedEmail) {
      res.status(409).json({ message: 'An account with this email already exists. Please sign in.' });
      return;
    }
  }
  const id = crypto.randomUUID();
  const newProfile: Profile = {
    id,
    email: normalizedEmail,
    password: String(password),
    full_name: String(fullName || 'Student').trim() || 'Student',
    student_id: studentId ? String(studentId).trim() : null,
    phone: null,
    role: 'student',
    created_at: new Date().toISOString(),
  };
  profiles.set(id, newProfile);
  const accessToken = `token-${id}`;
  tokenStore.set(accessToken, id);

  const { password: _, ...safeProfile } = newProfile;
  res.json({
    session: {
      access_token: accessToken,
      user: { id, email: newProfile.email },
    },
    profile: safeProfile,
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  let matched: Profile | undefined;
  for (const p of profiles.values()) {
    if (p.email.toLowerCase() === normalizedEmail) {
      matched = p;
      break;
    }
  }
  if (!matched || (matched.password && matched.password !== password)) {
    res.status(401).json({ message: 'Invalid email or password. Use demo credentials or create an account.' });
    return;
  }
  const accessToken = matched.role === 'admin' ? 'demo-admin-token' : `token-${matched.id}`;
  tokenStore.set(accessToken, matched.id);
  const { password: _, ...safeProfile } = matched;
  res.json({
    session: {
      access_token: accessToken,
      user: { id: matched.id, email: matched.email },
    },
    profile: safeProfile,
  });
});

// Profile endpoints
app.get('/api/me', (req, res) => {
  try {
    const p = getAuthProfile(req);
    const { password: _, ...safe } = p;
    res.json(safe);
  } catch (e: any) {
    res.status(e.status || 401).json({ message: e.message });
  }
});

app.put('/api/me', (req, res) => {
  try {
    const p = getAuthProfile(req);
    const { fullName, studentId, phone } = req.body || {};
    if (!fullName || !String(fullName).trim()) {
      res.status(400).json({ message: 'Name is required' });
      return;
    }
    p.full_name = String(fullName).trim();
    p.student_id = studentId ? String(studentId).trim() : null;
    p.phone = phone ? String(phone).trim() : null;
    const { password: _, ...safe } = p;
    res.json(safe);
  } catch (e: any) {
    res.status(e.status || 401).json({ message: e.message });
  }
});

// Categories & Menu
app.get('/api/categories', (_req, res) => {
  res.json([...categories].sort((a, b) => a.name.localeCompare(b.name)));
});

app.get('/api/menu', (req, res) => {
  const q = req.query.q ? String(req.query.q).toLowerCase() : null;
  const category = req.query.category ? String(req.query.category) : null;
  const available = req.query.available !== undefined ? req.query.available === 'true' : null;

  const filtered = menuItems
    .filter((m) => {
      if (q && !m.name.toLowerCase().includes(q) && !(m.description || '').toLowerCase().includes(q)) {
        return false;
      }
      if (category && m.category !== category) {
        return false;
      }
      if (available !== null && m.is_available !== available) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  res.json(filtered);
});

// Orders
app.post('/api/orders', (req, res) => {
  try {
    const student = getAuthProfile(req);
    const { items, paymentMethod, pickupSlot, customerName, phone, campusLocation, orderNotes } = req.body || {};

    // Prevent accidental double clicks / rapid duplicate submissions within 2.5 seconds
    const lastTime = lastOrderTimeByUser.get(student.id) || 0;
    const nowMs = Date.now();
    if (nowMs - lastTime < 2500) {
      res.status(429).json({ message: 'Order already being processed. Please wait a moment.' });
      return;
    }
    lastOrderTimeByUser.set(student.id, nowMs);

    if (paymentMethod !== 'PAY_AT_COUNTER') {
      res.status(400).json({ message: 'Only Pay at Counter is currently supported' });
      return;
    }
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'Cart cannot be empty' });
      return;
    }

    const effectiveName = String(customerName || student.full_name || '').trim();
    const effectivePhone = String(phone || student.phone || '').trim();
    const effectiveLocation = String(campusLocation || CAMPUS_LOCATIONS[0]).trim();
    const effectiveNotes = String(orderNotes || '').trim();

    const validation = validateCheckoutDetails({
      customerName: effectiveName,
      phone: effectivePhone,
      campusLocation: effectiveLocation,
      orderNotes: effectiveNotes,
    });

    if (!validation.valid) {
      res.status(400).json({ message: validation.error || 'Invalid checkout details' });
      return;
    }

    // Save phone and name back to profile if profile lacks them
    if (!student.phone && effectivePhone) {
      student.phone = effectivePhone;
    }
    if (!student.full_name && effectiveName) {
      student.full_name = effectiveName;
    }

    const menuMap = new Map(menuItems.map((m) => [m.id, m]));
    const calc = calculateOrderTotals(items, menuMap);

    let parsedPickup: string | null = null;
    if (pickupSlot && String(pickupSlot).trim()) {
      const dt = new Date(pickupSlot);
      if (Number.isNaN(dt.getTime())) {
        res.status(400).json({ message: 'Invalid pickup time' });
        return;
      }
      parsedPickup = dt.toISOString();
    }

    const token = generatePickupToken();
    const orderId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const estimatedReadyAt = new Date(Date.now() + calc.maxPrepMinutes * 60000).toISOString();

    const newOrder: OrderRecord = {
      id: orderId,
      token_number: token,
      student_id: student.id,
      student_name: effectiveName,
      student_code: student.student_id,
      phone: effectivePhone,
      status: 'Pending',
      total_amount: calc.totalAmount,
      payment_method: 'Pay at Counter',
      payment_status: 'unpaid',
      pickup_slot: parsedPickup,
      campus_location: effectiveLocation,
      order_notes: effectiveNotes || null,
      estimated_ready_at: estimatedReadyAt,
      cancellation_reason: null,
      created_at: createdAt,
      updated_at: createdAt,
      items: calc.items,
      history: [
        {
          old_status: null,
          new_status: 'Pending',
          changed_by: student.id,
          created_at: createdAt,
        },
      ],
    };

    orders.unshift(newOrder);
    notifications.unshift({
      id: crypto.randomUUID(),
      user_id: student.id,
      order_id: orderId,
      title: 'Order placed',
      message: `Your token ${token} is confirmed. Location: ${effectiveLocation}.`,
      is_read: false,
      created_at: createdAt,
    });

    res.json({
      id: orderId,
      tokenNumber: token,
      status: 'Pending',
      totalAmount: calc.totalAmount,
      paymentMethod: 'Pay at Counter',
      campusLocation: effectiveLocation,
      orderNotes: effectiveNotes,
      estimatedReadyAt,
      items: calc.items,
    });
  } catch (e: any) {
    res.status(e.status || 400).json({ message: e.message || 'Failed to place order' });
  }
});

// Reorder helper: verify past order items against current live menu
app.post('/api/orders/:id/reorder', (req, res) => {
  try {
    const user = getAuthProfile(req);
    const ord = orders.find((o) => o.id === req.params.id && (user.role === 'admin' || o.student_id === user.id));
    if (!ord) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    const menuMap = new Map(menuItems.map((m) => [m.id, m]));
    const result = reorderItemsFromOrder(ord, menuMap);
    res.json({
      orderId: ord.id,
      tokenNumber: ord.token_number,
      availableItems: result.availableItems,
      unavailableItemNames: result.unavailableItemNames,
    });
  } catch (e: any) {
    res.status(e.status || 400).json({ message: e.message || 'Failed to prepare reorder' });
  }
});

app.get('/api/orders/mine', (req, res) => {
  try {
    const user = getAuthProfile(req);
    const mine = orders
      .filter((o) => o.student_id === user.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(mine);
  } catch (e: any) {
    res.status(e.status || 401).json({ message: e.message });
  }
});

app.get('/api/orders/:id', (req, res) => {
  try {
    const user = getAuthProfile(req);
    const isAdmin = user.role === 'admin';
    const ord = orders.find((o) => o.id === req.params.id && (isAdmin || o.student_id === user.id));
    if (!ord) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.json(ord);
  } catch (e: any) {
    res.status(e.status || 401).json({ message: e.message });
  }
});

app.post('/api/orders/:id/cancel', (req, res) => {
  try {
    const user = getAuthProfile(req);
    const ord = orders.find((o) => o.id === req.params.id && o.student_id === user.id);
    if (!ord) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    if (!canStudentCancel(ord.status)) {
      res.status(409).json({ message: 'This order can no longer be cancelled' });
      return;
    }
    const oldStatus = ord.status;
    const reason = req.body?.reason || 'Cancelled by student';
    ord.status = 'Cancelled';
    ord.cancellation_reason = reason;
    ord.updated_at = new Date().toISOString();
    ord.history.push({
      old_status: oldStatus,
      new_status: 'Cancelled',
      changed_by: user.id,
      created_at: ord.updated_at,
    });
    notifications.unshift({
      id: crypto.randomUUID(),
      user_id: user.id,
      order_id: ord.id,
      title: 'Order cancelled',
      message: reason,
      is_read: false,
      created_at: ord.updated_at,
    });
    res.json({ id: ord.id, status: 'Cancelled' });
  } catch (e: any) {
    res.status(e.status || 400).json({ message: e.message });
  }
});

// Notifications
app.get('/api/notifications', (req, res) => {
  try {
    const user = getAuthProfile(req);
    const list = notifications
      .filter((n) => n.user_id === user.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 100);
    res.json(list);
  } catch (e: any) {
    res.status(e.status || 401).json({ message: e.message });
  }
});

app.patch('/api/notifications/:id/read', (req, res) => {
  try {
    const user = getAuthProfile(req);
    const notif = notifications.find((n) => n.id === req.params.id && n.user_id === user.id);
    if (!notif) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    notif.is_read = true;
    res.json({ success: true });
  } catch (e: any) {
    res.status(e.status || 401).json({ message: e.message });
  }
});

// Admin endpoints
app.get('/api/admin/dashboard', (req, res) => {
  try {
    requireAdmin(req);
    const todayStr = new Date().toISOString().slice(0, 10);
    const total_today = orders.filter((o) => o.created_at.slice(0, 10) === todayStr).length;
    const pending = orders.filter((o) => o.status === 'Pending').length;
    const accepted = orders.filter((o) => o.status === 'Accepted').length;
    const preparing = orders.filter((o) => o.status === 'Preparing').length;
    const ready = orders.filter((o) => o.status === 'Ready for Pickup').length;
    const completed = orders.filter((o) => o.status === 'Completed').length;
    const cancelled = orders.filter((o) => o.status === 'Cancelled').length;
    const sales_today = orders
      .filter((o) => o.status === 'Completed' && o.created_at.slice(0, 10) === todayStr)
      .reduce((sum, o) => sum + o.total_amount, 0);

    res.json({
      total_today,
      pending,
      accepted,
      preparing,
      ready,
      completed,
      cancelled,
      sales_today: Number(sales_today.toFixed(2)),
    });
  } catch (e: any) {
    res.status(e.status || 403).json({ message: e.message });
  }
});

app.get('/api/admin/orders', (req, res) => {
  try {
    requireAdmin(req);
    const status = req.query.status ? String(req.query.status) : null;
    const q = req.query.q ? String(req.query.q).toLowerCase() : null;

    const statusPriority: Record<string, number> = {
      Pending: 0,
      Accepted: 1,
      Preparing: 2,
      'Ready for Pickup': 3,
      Completed: 4,
      Cancelled: 5,
    };

    const list = orders
      .filter((o) => {
        if (status && o.status !== status) return false;
        if (q) {
          const matchToken = o.token_number.toLowerCase().includes(q);
          const matchName = (o.student_name || '').toLowerCase().includes(q);
          const matchId = (o.student_code || '').toLowerCase().includes(q);
          if (!matchToken && !matchName && !matchId) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const pa = statusPriority[a.status] ?? 9;
        const pb = statusPriority[b.status] ?? 9;
        if (pa !== pb) return pa - pb;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });

    res.json(list);
  } catch (e: any) {
    res.status(e.status || 403).json({ message: e.message });
  }
});

app.patch('/api/admin/orders/:id/status', (req, res) => {
  try {
    const adminUser = requireAdmin(req);
    const { status, reason } = req.body || {};
    const ord = orders.find((o) => o.id === req.params.id);
    if (!ord) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    const targetStatus = status as OrderStatus;
    if (!isValidStatusTransition(ord.status, targetStatus)) {
      res.status(409).json({ message: `Transition not allowed: ${ord.status} → ${targetStatus}` });
      return;
    }

    const oldStatus = ord.status;
    ord.status = targetStatus;
    if (targetStatus === 'Cancelled') {
      ord.cancellation_reason = reason || 'Cancelled by canteen manager';
    }
    if (targetStatus === 'Completed') {
      ord.payment_status = 'paid';
    }
    ord.updated_at = new Date().toISOString();
    ord.history.push({
      old_status: oldStatus,
      new_status: targetStatus,
      changed_by: adminUser.id,
      created_at: ord.updated_at,
    });

    const msgMap: Record<string, string> = {
      Accepted: 'The canteen accepted your order.',
      Preparing: 'Your food is now being prepared.',
      'Ready for Pickup': 'Your order is ready. Please collect it at the counter.',
      Completed: 'Your order has been completed. Thank you!',
      Cancelled: `Your order was cancelled. ${reason || ''}`.trim(),
    };

    notifications.unshift({
      id: crypto.randomUUID(),
      user_id: ord.student_id,
      order_id: ord.id,
      title: `Order ${targetStatus}`,
      message: msgMap[targetStatus] || `Order status updated to ${targetStatus}`,
      is_read: false,
      created_at: ord.updated_at,
    });

    res.json({ id: ord.id, status: ord.status });
  } catch (e: any) {
    res.status(e.status || 400).json({ message: e.message });
  }
});

app.post('/api/admin/menu', (req, res) => {
  try {
    requireAdmin(req);
    const m = req.body || {};
    if (!m.name || !String(m.name).trim()) {
      res.status(400).json({ message: 'Food name is required' });
      return;
    }
    const cat = categories.find((c) => c.id === m.categoryId) || categories[0];
    const id = crypto.randomUUID();
    const price = Number(m.price);
    if (Number.isNaN(price) || price <= 0) {
      res.status(400).json({ message: 'Valid price is required' });
      return;
    }
    const newItem: MenuItem = {
      id,
      name: String(m.name).trim(),
      description: String(m.description || '').trim(),
      category_id: cat.id,
      category: cat.name,
      price,
      image_url:
        m.imageUrl && String(m.imageUrl).trim()
          ? String(m.imageUrl).trim()
          : createFoodSvgDataUri(String(m.name).trim(), '#1458d4', '#eff6ff', '#dbeafe', '🍽️'),
      is_available: Boolean(m.isAvailable ?? true),
      is_vegetarian: m.isVegetarian === undefined ? true : m.isVegetarian,
      preparation_time_minutes: Number(m.preparationTimeMinutes) || 10,
      is_featured: Boolean(m.isFeatured ?? false),
    };
    menuItems.push(newItem);
    res.json({ id, success: true, item: newItem });
  } catch (e: any) {
    res.status(e.status || 400).json({ message: e.message });
  }
});

app.put('/api/admin/menu/:id', (req, res) => {
  try {
    requireAdmin(req);
    const idx = menuItems.findIndex((x) => x.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ message: 'Menu item not found' });
      return;
    }
    const m = req.body || {};
    const cat = categories.find((c) => c.id === m.categoryId) || categories.find((c) => c.id === menuItems[idx].category_id) || categories[0];
    menuItems[idx] = {
      ...menuItems[idx],
      name: String(m.name || menuItems[idx].name).trim(),
      description: m.description !== undefined ? String(m.description) : menuItems[idx].description,
      category_id: cat.id,
      category: cat.name,
      price: Number(m.price) || menuItems[idx].price,
      image_url:
        m.imageUrl && String(m.imageUrl).trim()
          ? String(m.imageUrl).trim()
          : menuItems[idx].image_url,
      is_available: Boolean(m.isAvailable),
      is_vegetarian: m.isVegetarian === undefined ? menuItems[idx].is_vegetarian : m.isVegetarian,
      preparation_time_minutes: Number(m.preparationTimeMinutes) || menuItems[idx].preparation_time_minutes,
      is_featured: Boolean(m.isFeatured),
    };
    res.json({ success: true, item: menuItems[idx] });
  } catch (e: any) {
    res.status(e.status || 400).json({ message: e.message });
  }
});

app.delete('/api/admin/menu/:id', (req, res) => {
  try {
    requireAdmin(req);
    const idx = menuItems.findIndex((x) => x.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ message: 'Menu item not found' });
      return;
    }
    menuItems.splice(idx, 1);
    res.json({ success: true });
  } catch (e: any) {
    res.status(e.status || 400).json({ message: e.message });
  }
});

app.get('/api/admin/reports', (req, res) => {
  try {
    requireAdmin(req);
    const nowDate = new Date();
    const defaultStart = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1).toISOString().slice(0, 10);
    const defaultEnd = nowDate.toISOString().slice(0, 10);
    const from = req.query.from ? String(req.query.from) : defaultStart;
    const to = req.query.to ? String(req.query.to) : defaultEnd;

    const inRange = orders.filter((o) => {
      const d = o.created_at.slice(0, 10);
      return d >= from && d <= to;
    });

    const order_count = inRange.length;
    const cancellations = inRange.filter((o) => o.status === 'Cancelled').length;
    const completed_sales = inRange
      .filter((o) => o.status === 'Completed')
      .reduce((s, o) => s + o.total_amount, 0);
    const gross_non_cancelled_value = inRange
      .filter((o) => o.status !== 'Cancelled')
      .reduce((s, o) => s + o.total_amount, 0);

    const itemCounts = new Map<string, number>();
    for (const o of inRange) {
      if (o.status === 'Completed') {
        for (const line of o.items) {
          itemCounts.set(line.item_name, (itemCounts.get(line.item_name) || 0) + line.quantity);
        }
      }
    }

    const popularItems = Array.from(itemCounts.entries())
      .map(([item_name, quantity]) => ({ item_name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);

    const statusCounts = new Map<string, number>();
    for (const o of inRange) {
      statusCounts.set(o.status, (statusCounts.get(o.status) || 0) + 1);
    }
    const statuses = Array.from(statusCounts.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => a.status.localeCompare(b.status));

    res.json({
      from,
      to,
      totals: {
        order_count,
        cancellations,
        completed_sales: Number(completed_sales.toFixed(2)),
        gross_non_cancelled_value: Number(gross_non_cancelled_value.toFixed(2)),
      },
      popularItems,
      statuses,
    });
  } catch (e: any) {
    res.status(e.status || 400).json({ message: e.message });
  }
});

// async function startServer() {
//   if (process.env.NODE_ENV !== 'production') {
//     const vite = await createViteServer({
//       server: { middlewareMode: true },
//       appType: 'spa',
//     });
//     app.use(vite.middlewares);
//   } else {
//     const distPath = path.join(process.cwd(), 'dist');
//     app.use(express.static(distPath));
//     app.get('*', (_req, res) => {
//       res.sendFile(path.join(distPath, 'index.html'));
//     });
//   }

//   const PORT = 3000;
//   app.listen(PORT, '0.0.0.0', () => {
//     console.log(`CampusBite Smart Canteen server running at http://localhost:${PORT}`);
//   });
// }

// startServer();


async function startServer() {
  if (process.env.NODE_ENV !== 'production') {

    const distPath = path.join(process.cwd(), 'dist');

    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);
  }




  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartQuene server running on port ${PORT}`);
  });
}

startServer();
