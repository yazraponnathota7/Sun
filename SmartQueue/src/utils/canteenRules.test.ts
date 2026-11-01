import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidStatusTransition,
  canStudentCancel,
  calculateOrderTotals,
  generatePickupToken,
  formatMoney,
  statusClass,
  validateCheckoutDetails,
  reorderItemsFromOrder,
  CAMPUS_LOCATIONS,
  type MenuItem,
  type OrderRecord,
} from './canteenRules';

const sampleMenu = new Map<string, MenuItem>([
  [
    'item-dosa',
    {
      id: 'item-dosa',
      name: 'Masala Dosa',
      description: 'Crispy dosa with potato masala',
      category_id: 'cat-1',
      category: 'Breakfast',
      price: 55,
      image_url: '',
      is_available: true,
      is_vegetarian: true,
      preparation_time_minutes: 12,
      is_featured: true,
    },
  ],
  [
    'item-coffee',
    {
      id: 'item-coffee',
      name: 'Cold Coffee',
      description: 'Chilled creamy coffee',
      category_id: 'cat-5',
      category: 'Beverages',
      price: 50,
      image_url: '',
      is_available: true,
      is_vegetarian: true,
      preparation_time_minutes: 4,
      is_featured: true,
    },
  ],
  [
    'item-soldout',
    {
      id: 'item-soldout',
      name: 'Special Thali',
      description: 'Sold out item',
      category_id: 'cat-2',
      category: 'Meals',
      price: 110,
      image_url: '',
      is_available: false,
      is_vegetarian: true,
      preparation_time_minutes: 15,
      is_featured: false,
    },
  ],
]);

test('order totals calculation merges duplicate items and finds max prep time', () => {
  const res = calculateOrderTotals(
    [
      { menuItemId: 'item-dosa', quantity: 2 },
      { menuItemId: 'item-coffee', quantity: 1 },
      { menuItemId: 'item-dosa', quantity: 1 },
    ],
    sampleMenu
  );
  assert.equal(res.totalAmount, 215);
  assert.equal(res.maxPrepMinutes, 12);
  assert.equal(res.items.length, 2);
  assert.equal(res.items[0].quantity, 3);
  assert.equal(res.items[0].subtotal, 165);
});

test('order calculation rejects sold out items', () => {
  assert.throws(
    () => calculateOrderTotals([{ menuItemId: 'item-soldout', quantity: 1 }], sampleMenu),
    /Special Thali is sold out/
  );
});

test('status transitions follow strict canteen workflow rules', () => {
  assert.equal(isValidStatusTransition('Pending', 'Accepted'), true);
  assert.equal(isValidStatusTransition('Pending', 'Completed'), false);
  assert.equal(isValidStatusTransition('Accepted', 'Preparing'), true);
  assert.equal(isValidStatusTransition('Preparing', 'Ready for Pickup'), true);
  assert.equal(isValidStatusTransition('Ready for Pickup', 'Completed'), true);
  assert.equal(isValidStatusTransition('Ready for Pickup', 'Cancelled'), false);
  assert.equal(isValidStatusTransition('Completed', 'Cancelled'), false);
});

test('student cancellation is only permitted in Pending or Accepted states', () => {
  assert.equal(canStudentCancel('Pending'), true);
  assert.equal(canStudentCancel('Accepted'), true);
  assert.equal(canStudentCancel('Preparing'), false);
  assert.equal(canStudentCancel('Ready for Pickup'), false);
  assert.equal(canStudentCancel('Completed'), false);
});

test('pickup token generator and formatting helpers work deterministically', () => {
  const token = generatePickupToken(new Date('2026-10-30T10:00:00Z'));
  assert.match(token, /^SC-20261030-[A-Z0-9]{6}$/);
  assert.equal(statusClass('Ready for Pickup'), 'ready-for-pickup');
  assert.ok(formatMoney(55).includes('55'));
});

test('validateCheckoutDetails validates customer name, phone, and note limits', () => {
  assert.equal(validateCheckoutDetails({ customerName: '', phone: '9876543210' }).valid, false);
  assert.equal(validateCheckoutDetails({ customerName: 'Aarav', phone: '' }).valid, false);
  assert.equal(validateCheckoutDetails({ customerName: 'Aarav', phone: '123' }).valid, false);
  assert.equal(
    validateCheckoutDetails({
      customerName: 'Aarav Sharma',
      phone: '+91 98765 43210',
      campusLocation: CAMPUS_LOCATIONS[0],
      orderNotes: 'Pack chutney separately',
    }).valid,
    true
  );
  assert.equal(
    validateCheckoutDetails({
      customerName: 'Aarav',
      phone: '9876543210',
      orderNotes: 'a'.repeat(305),
    }).valid,
    false
  );
});

test('reorderItemsFromOrder identifies available items and flags sold out items', () => {
  const dummyOrder: OrderRecord = {
    id: 'ord-test-past',
    token_number: 'SC-20261030-ABCDEF',
    student_id: 'std-1',
    student_name: 'Aarav',
    status: 'Completed',
    total_amount: 165,
    payment_method: 'Pay at Counter',
    payment_status: 'paid',
    pickup_slot: null,
    estimated_ready_at: new Date().toISOString(),
    cancellation_reason: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        menu_item_id: 'item-dosa',
        item_name: 'Masala Dosa',
        unit_price: 55,
        quantity: 2,
        subtotal: 110,
      },
      {
        menu_item_id: 'item-soldout',
        item_name: 'Special Thali',
        unit_price: 110,
        quantity: 1,
        subtotal: 110,
      },
    ],
    history: [],
  };

  const res = reorderItemsFromOrder(dummyOrder, sampleMenu);
  assert.equal(res.availableItems.length, 1);
  assert.equal(res.availableItems[0].name, 'Masala Dosa');
  assert.equal(res.availableItems[0].qty, 2);
  assert.deepEqual(res.unavailableItemNames, ['Special Thali']);
});

