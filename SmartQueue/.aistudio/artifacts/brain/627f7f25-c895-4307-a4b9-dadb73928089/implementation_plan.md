# CampusBite — Smart Canteen Management System

Production-ready campus food ordering platform connecting university students, staff, and canteen operators with real-time order tracking, dedicated Order History with one-click reordering, campus zone pickup/desk delivery options, and secure multi-role admin controls.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions have been incorporated based on your feedback to ensure CampusBite works out of the box immediately for all users while providing complete database portability:

- **Confirmed Database Architecture**: Standalone, zero-config fullstack persistence on Node.js/Express that works immediately for any student or canteen admin with no external signup friction, paired with complete copy-pasteable Supabase PostgreSQL migrations (`supabase/migrations/20250101_init.sql`) including Row Level Security (RLS) policies, foreign keys, and indexes for live cloud deployments.
- **Confirmed Reorder Behavior**: Clicking "Reorder" on past completed or cancelled orders loads the exact items directly into the student's active cart with live inventory verification and routes directly to cart review.
- **Confirmed Campus Delivery/Pickup**: Enhanced checkout captures Student Name, Contact Phone, Campus Zone (Hostel Blocks, Academic Wings, Central Library, Student Center, or Canteen Counter), and special kitchen notes.

---

### 1. Overview & Core Concept

CampusBite solves peak-hour dining congestion in campus dining halls. Students browse daily menu items with real-time dietary badges (Veg, Non-Veg, Vegan, Halal), customize quantities, and place orders with clear "Pay at Counter / Cash on Pickup" transparency. 

Key user personas:
1. **Campus Diners (Students / Faculty / Staff)**: Quick-browse menu, search & category filtering, cart management, transparent checkout with pickup time & campus zone notes, live order tracking token, and persistent Order History with instant one-click reorder.
2. **Canteen Staff & Kitchen Administrators**: Live incoming order queue with audio/visual status progression (Pending $\to$ Confirmed $\to$ Preparing $\to$ Ready for Pickup $\to$ Completed / Cancelled), menu item pricing/stock/dietary controls, and sales summary metrics.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Student Ordering Flow**:
   - Landing/Menu View $\to$ Filter by category (Breakfast, Bowls & Meals, Quick Bites, Beverages, Desserts) or search $\to$ Add to cart with quantity adjustments.
   - Cart $\to$ Enhanced Checkout form: Student Full Name, Phone Number, Campus Zone Dropdown, Pickup Window selection, Order Notes $\to$ Instant token generation (`#CB-XXXX`).
   - Order Status Screen $\to$ Real-time progress bar (Pending $\to$ Confirmed $\to$ Preparing $\to$ Ready $\to$ Completed) with estimated pickup time.
2. **Dedicated Order History Flow**:
   - Order History page (`/history`) displaying past completed, active, and cancelled orders.
   - Itemized receipts with quantities, price breakdown, and order timestamp.
   - One-click **"Reorder Items"** button that checks current item availability, restores the basket, and opens cart review.
3. **Canteen Kitchen Operator Flow**:
   - Secure Admin Dashboard $\to$ Live order feed sorted chronologically $\to$ Advance status with single-tap controls.
   - Menu Management $\to$ Edit item availability toggles, prices, descriptions, and dietary classifications.
   - Sales Reports $\to$ Daily gross revenue, order volume, and top-selling canteen items.

#### Visual Identity & Theme
- **Aesthetic Direction**: Clean, modern institutional food hall interface with energetic culinary accents, strict zero-pill metadata discipline, and high-contrast readability.
- **Color Palette (60-30-10 discipline)**:
  - Canvas (60%): `#f8fafc` (Slate 50) in light mode, `#090d16` (Deep Midnight Slate) in dark mode.
  - Structural Surfaces (30%): Pure white `#ffffff` cards with subtle `#e2e8f0` borders; dark mode `#111827` cards with `#1f2937` borders.
  - Culinary Accents (10%): `#1458d4` (Campus Royal Blue) for primary actions, `#16835d` (Emerald Kitchen Fresh) for vegetarian & completed tags, `#df7628` (Warm Saffron Ochre) for preparation & hot specials.
- **Typography**: Display/Hero in `Plus Jakarta Sans`, UI & body in `DM Sans`, order tokens & financial totals in `font-mono tabular-nums`.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual-Mode Persistence Strategy (Immediate Live Engine + Supabase Migration File)**
  - *Chosen Approach*: The application ships with a fully hydrated, hardened backend in `server.ts` that enforces real RBAC, server-side price recalculation, and state transitions so it is 100% interactive and testable immediately. In parallel, a production-grade `supabase/migrations/20250101_init.sql` script is provided with full table definitions, triggers, and Row Level Security (RLS) policies.
  - *Why*: Eliminates deployment blockers while giving full cloud database readiness with zero vendor lock-in.
- **Decision 2: Realistic Payment Safety (Counter Settlement)**
  - *Chosen Approach*: Unambiguous "Pay at Counter / Cash on Pickup" payment method with clear verification tokens. No mock credit card forms or fake third-party gateway simulators.
  - *Why*: Complies with institutional campus canteen operational norms and strictly honors prompt safety rules against simulating artificial payments.
- **Decision 3: Server-Side Price & Inventory Guardrails**
  - *Chosen Approach*: Order totals, taxes, and discounts are recalculated strictly on the server using authoritative database item records; client cart prices are treated purely as display values.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                   CampusBite Client                    │
│      React 19 + TypeScript + Tailwind CSS v4           │
├───────────────┬────────────────────────┬───────────────┤
│  Menu / Cart  │ Checkout & Live Status │ Order History │
│   & Search    │   & Campus Location    │  & Reorder    │
└───────┬───────┴───────────┬────────────┴───────┬───────┘
        │                   │                    │
        ▼                   ▼                    ▼
┌────────────────────────────────────────────────────────┐
│              Fullstack Express API Layer               │
│           (Running alongside Vite dev server)          │
├────────────────────────────────────────────────────────┤
│ • /api/auth/*       (Session tokens & RBAC verification)│
│ • /api/menu/*       (Catalog & category filtering)     │
│ • /api/orders       (Server-validated checkout & locks)│
│ • /api/orders/mine  (User order history & receipts)    │
│ • /api/admin/*      (Status transitions & menu edits)  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Database Layer                       │
│ • Built-in authoritative store for immediate live use  │
│ • Supabase SQL migration schema with full RLS          │
└────────────────────────────────────────────────────────┘
```

#### Core Data Entities
- `profiles`: `id`, `email`, `full_name`, `phone`, `role ('student' | 'admin')`, `created_at`
- `categories`: `id`, `name`, `slug`, `icon`, `sort_order`
- `menu_items`: `id`, `category_id`, `name`, `description`, `price`, `dietary ('veg'|'non-veg'|'vegan')`, `is_available`, `image_url`
- `orders`: `id`, `user_id`, `token_number`, `status ('pending'|'confirmed'|'preparing'|'ready'|'completed'|'cancelled')`, `payment_status`, `payment_method`, `subtotal`, `tax`, `total`, `pickup_time`, `campus_location`, `order_notes`, `created_at`
- `order_items`: `id`, `order_id`, `menu_item_id`, `item_name`, `quantity`, `unit_price`, `subtotal`

#### Verification Plan
- Run automated unit tests for price calculation, dietary filtering, and checkout validation.
- Run `npm run lint` (`tsc --noEmit`) to verify zero type regressions.
- Run `npm run build` to verify clean production bundling.
- Validate desktop (1440px) and mobile phone (390px) responsive layouts.
