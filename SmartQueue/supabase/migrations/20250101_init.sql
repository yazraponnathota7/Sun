-- ====================================================================
-- CampusBite Smart Canteen Management System — Production SQL Schema
-- Compatible with Supabase (PostgreSQL 15+)
-- Contains full table schemas, foreign keys, indexes, triggers, and Row Level Security (RLS) policies.
-- ====================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. PROFILES TABLE (Linked to auth.users)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  student_id TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS:
-- Users can view their own profile.
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admins can view all profiles.
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Users can update their own profile (name, phone, student_id) but CANNOT change role.
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      -- Prevent privilege escalation: role must stay same or caller must be admin
      role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
      OR (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) = 'admin'
    )
  );

-- --------------------------------------------------------------------
-- 2. CATEGORIES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Anyone (authenticated or public) can read menu categories
CREATE POLICY "Public read categories"
  ON public.categories FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only admins can manage categories
CREATE POLICY "Admins insert categories"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins update categories"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins delete categories"
  ON public.categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- --------------------------------------------------------------------
-- 3. MENU ITEMS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.menu_items (
  id TEXT PRIMARY KEY DEFAULT ('item-' || uuid_generate_v4()::text),
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_vegetarian BOOLEAN DEFAULT true,
  preparation_time_minutes INT NOT NULL DEFAULT 10 CHECK (preparation_time_minutes >= 1),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(is_available);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Anyone can read available menu items
CREATE POLICY "Public read menu items"
  ON public.menu_items FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only admins can insert, update, delete menu items
CREATE POLICY "Admins insert menu items"
  ON public.menu_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins update menu items"
  ON public.menu_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins delete menu items"
  ON public.menu_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- --------------------------------------------------------------------
-- 4. ORDERS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_number TEXT NOT NULL UNIQUE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_code TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled')),
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  payment_method TEXT NOT NULL DEFAULT 'Pay at Counter',
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  pickup_slot TIMESTAMPTZ,
  campus_location TEXT NOT NULL DEFAULT 'Main Canteen Counter',
  order_notes TEXT,
  estimated_ready_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_student_id ON public.orders(student_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Students can view only their own orders
CREATE POLICY "Students view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Students can insert orders for themselves (payment_status defaults to unpaid)
CREATE POLICY "Students insert own orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    AND payment_status = 'unpaid'
    AND status = 'Pending'
  );

-- Students can cancel their own orders while in Pending or Accepted status
CREATE POLICY "Students cancel own orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    student_id = auth.uid()
    AND status IN ('Pending', 'Accepted')
  )
  WITH CHECK (
    student_id = auth.uid()
    AND status = 'Cancelled'
  );

-- Admins can update any order (status, payment_status, cancellation)
CREATE POLICY "Admins update all orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- --------------------------------------------------------------------
-- 5. ORDER ITEMS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id TEXT NOT NULL REFERENCES public.menu_items(id) ON DELETE RESTRICT,
  item_name TEXT NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  quantity INT NOT NULL CHECK (quantity >= 1 AND quantity <= 30),
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Order items can be read by the student who owns the parent order or by an admin
CREATE POLICY "View order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND (orders.student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

CREATE POLICY "Insert order items"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.student_id = auth.uid()
    )
  );

-- --------------------------------------------------------------------
-- 6. ORDER STATUS HISTORY & NOTIFICATIONS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_order_history_order ON public.order_status_history(order_id);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View order history"
  ON public.order_status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_status_history.order_id
        AND (orders.student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users mark notifications read"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- --------------------------------------------------------------------
-- 7. INITIAL SEED DATA
-- --------------------------------------------------------------------
INSERT INTO public.categories (id, name, description, sort_order)
VALUES
  ('cat-breakfast', 'Breakfast', 'Fresh morning favourites', 1),
  ('cat-meals', 'Meals', 'Filling campus lunch & dinner thalis', 2),
  ('cat-snacks', 'Snacks', 'Quick bites between lectures', 3),
  ('cat-fastfood', 'Fast Food', 'Campus rolls, wraps and grills', 4),
  ('cat-beverages', 'Beverages', 'Refreshing teas, coffees and juices', 5),
  ('cat-desserts', 'Desserts', 'Sweet treats and bakery items', 6)
ON CONFLICT (id) DO NOTHING;
