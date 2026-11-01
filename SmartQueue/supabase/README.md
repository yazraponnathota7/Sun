# Supabase Setup Guide for CampusBite

CampusBite includes a standalone fullstack persistence layer running automatically inside `server.ts` so that you and your users can use all features immediately with zero external dependencies.

If you wish to connect a live Supabase project for external cloud database hosting, follow these simple steps:

### 1. Run the Database Migration
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project and open the **SQL Editor** tab from the left sidebar.
3. Open `supabase/migrations/20250101_init.sql` from this repository.
4. Copy and paste the contents into the SQL Editor and click **Run**.
5. This provisions all tables (`profiles`, `categories`, `menu_items`, `orders`, `order_items`, `order_status_history`, `notifications`), indexes, triggers, and comprehensive **Row Level Security (RLS)** policies.

### 2. Configure Environment Variables
Set the following keys in your `.env` (or AI Studio environment settings):

```bash
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
```

### 3. Row Level Security (RLS) Summary
- **Public & Students**: Can read categories and active menu items.
- **Students**: Can view only their own orders and notifications.
- **Admins**: Can view all orders, manage the menu catalog, change order statuses, and access operational reports.
- **Price Security**: Client-side tampering of totals or role elevation is strictly prevented by database constraints and server recalculation.
