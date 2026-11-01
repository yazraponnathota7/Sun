import React, { useEffect, useState, createContext, useContext } from 'react';
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  UtensilsCrossed,
  Clock3,
  ArrowRight,
  Plus,
  Minus,
  Trash2,
  LayoutDashboard,
  ClipboardList,
  ChefHat,
  BarChart3,
  LogOut,
  UserRound,
  Bell,
  Flame,
  CheckCircle2,
  Menu as MenuIcon,
  X,
  RefreshCw,
  RotateCcw,
  MapPin,
  FileText,
  History,
} from 'lucide-react';
import { supabase, api, money, statusClass, HERO_FALLBACK_IMAGE, type Session } from './lib';
import { CAMPUS_LOCATIONS } from './utils/canteenRules';

interface AppContextType {
  session: Session | null;
  profile: any;
  setProfile: React.Dispatch<React.SetStateAction<any>>;
  cart: any[];
  setCart: React.Dispatch<React.SetStateAction<any[]>>;
  toast: string;
  setToast: React.Dispatch<React.SetStateAction<string>>;
  logout: () => Promise<void>;
  quickLogin: (role: 'student' | 'admin') => Promise<void>;
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Ctx = createContext<AppContextType | null>(null);
export const useApp = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within App provider');
  return ctx;
};

export function App() {
  const [session, setSession] = useState<Session | null>(() => {
    try {
      const raw = localStorage.getItem('campusbite_session_v1');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [toast, setToast] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      return;
    }
    api('/me')
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [session]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('autostart') === '1' && !session) {
      quickLogin('student');
    }
  }, [location.search]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const logout = async () => {
    await supabase.auth.signOut();
    setCart([]);
    setProfile(null);
    navigate('/');
  };

  const quickLogin = async (role: 'student' | 'admin') => {
    const creds =
      role === 'admin'
        ? { email: 'admin@campus.edu', password: 'admin123' }
        : { email: 'student@campus.edu', password: 'password123' };
    const { error } = await supabase.auth.signInWithPassword(creds);
    if (error) {
      setToast(error.message);
      return;
    }
    const p = await api('/me');
    setProfile(p);
    setToast(role === 'admin' ? 'Signed in as Canteen Manager' : 'Signed in as Student (Aarav Sharma)');
    navigate(role === 'admin' ? '/admin' : '/home');
  };

  const value: AppContextType = {
    session,
    profile,
    setProfile,
    cart,
    setCart,
    toast,
    setToast,
    logout,
    quickLogin,
    menuOpen,
    setMenuOpen,
  };

  return (
    <Ctx.Provider value={value}>
      <div className="app-shell">
        <Header />
        <main className="main">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/signup" element={<Auth mode="signup" />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/admin-login" element={<Auth mode="admin" />} />
            <Route
              path="/home"
              element={
                <Guard>
                  <Home />
                </Guard>
              }
            />
            <Route path="/menu" element={<MenuPage />} />
            <Route
              path="/cart"
              element={
                <Guard>
                  <Cart />
                </Guard>
              }
            />
            <Route
              path="/checkout"
              element={
                <Guard>
                  <Checkout />
                </Guard>
              }
            />
            <Route
              path="/orders"
              element={
                <Guard>
                  <Orders />
                </Guard>
              }
            />
            <Route
              path="/history"
              element={
                <Guard>
                  <OrderHistory />
                </Guard>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <Guard>
                  <OrderDetail />
                </Guard>
              }
            />
            <Route
              path="/profile"
              element={
                <Guard>
                  <Profile />
                </Guard>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminDashboard />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminGuard>
                  <AdminOrders />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/menu"
              element={
                <AdminGuard>
                  <AdminMenu />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminGuard>
                  <Reports />
                </AdminGuard>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer>
          <div className="footer-inner">
            <span className="brand-mark small">
              <UtensilsCrossed size={16} />
            </span>
            <span>smartQ</span>
            <span className="muted">Made for campus life · Smart Canteen Management</span>
          </div>
        </footer>
        {toast && (
          <div className="toast" role="status" aria-live="polite">
            <CheckCircle2 size={17} />
            {toast}
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}

function Header() {
  const { session, profile, cart, logout, menuOpen, setMenuOpen } = useApp();
  const nav =
    profile?.role === 'admin'
      ? [
        ['Dashboard', '/admin'],
        ['Orders', '/admin/orders'],
        ['Food menu', '/admin/menu'],
        ['Reports', '/admin/reports'],
      ]
      : [
        ['Home', '/home'],
        ['Menu', '/menu'],
        ['My orders', '/orders'],
        ['Order history', '/history'],
      ];

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <header className="topbar">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <UtensilsCrossed size={19} />
          </span>
          <span>
            Smart<span className="brand-blue">Q</span>
          </span>
        </Link>

        <button
          className="mobile-toggle icon-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <MenuIcon />}
        </button>

        <nav className={menuOpen ? 'nav-links open' : 'nav-links'} aria-label="Primary navigation">
          {session && profile ? (
            nav.map(([n, p]) => (
              <Link key={p} to={p} onClick={() => setMenuOpen(false)} className="nav-link">
                {n}
              </Link>
            ))
          ) : (
            <>
              <Link to="/menu" onClick={() => setMenuOpen(false)} className="nav-link">
                Campus Menu
              </Link>
              <Link to="/admin-login" onClick={() => setMenuOpen(false)} className="nav-link">
                Canteen Admin
              </Link>
            </>
          )}

          {profile?.role !== 'admin' && (
            <Link to="/cart" onClick={() => setMenuOpen(false)} className="cart-link" aria-label="View shopping cart">
              <ShoppingBag size={17} /> Cart <span>{cartCount}</span>
            </Link>
          )}

          {session ? (
            <>
              <Link
                to={profile?.role === 'admin' ? '/admin' : '/profile'}
                onClick={() => setMenuOpen(false)}
                className="profile-link"
              >
                <UserRound size={17} />
                {profile?.full_name?.split(' ')[0] || 'Account'}
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={logout}>
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <Link className="btn btn-primary btn-sm" to="/login" onClick={() => setMenuOpen(false)}>
              Student login <ArrowRight size={15} />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function Guard({ children }: { children: React.ReactNode }) {
  const { session, profile } = useApp();
  if (!session) return <Navigate to="/login" replace />;
  if (!profile)
    return (
      <div className="center-state">
        <div className="spinner" />
        <p>Loading your profile…</p>
      </div>
    );
  if (profile.role === 'admin') return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { session, profile } = useApp();
  if (!session) return <Navigate to="/admin-login" replace />;
  if (!profile)
    return (
      <div className="center-state">
        <div className="spinner" />
        <p>Checking admin access…</p>
      </div>
    );
  return profile.role === 'admin' ? <>{children}</> : <Navigate to="/home" replace />;
}

function Landing() {
  const { quickLogin, session, profile } = useApp();
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">YOUR CAMPUS, YOUR CRAVINGS</div>
          <h1>
            Good food.
            <br />
            <span>Zero queue.</span>
          </h1>
          <p>
            Order your campus favourites before the bell rings. Skip the line, grab your digital pickup token, and make every break count.
          </p>
          <div className="hero-actions">
            {session ? (
              <Link to={profile?.role === 'admin' ? '/admin' : '/home'} className="btn btn-primary btn-lg">
                Go to {profile?.role === 'admin' ? 'Admin Dashboard' : 'Student Home'} <ArrowRight size={18} />
              </Link>
            ) : (
              <Link to="/signup" className="btn btn-primary btn-lg">
                Order your food <ArrowRight size={18} />
              </Link>
            )}
            <Link to="/menu" className="btn btn-light btn-lg">
              Explore menu
            </Link>
          </div>

          {!session && (
            <div className="demo-switcher-box">
              <small>INSTANT DEMO ACCESS (ONE-CLICK LOGIN)</small>
              <div className="demo-switcher-actions">
                <button
                  type="button"
                  className="btn btn-light btn-sm"
                  onClick={() => quickLogin('student')}
                >
                  <UserRound size={15} /> Demo Student Portal
                </button>
                <button
                  type="button"
                  className="btn btn-light btn-sm"
                  onClick={() => quickLogin('admin')}
                >
                  <LayoutDashboard size={15} /> Demo Canteen Admin
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="hero-visual">
          <div className="hero-image-wrap">
            <img
              src={HERO_FALLBACK_IMAGE}
              alt="Fresh colourful campus meal"
              referrerPolicy="no-referrer"
            />
            <div className="floating-tag tag-top">
              <span className="tag-icon">✦</span>
              <div>
                <b>Freshly prepared</b>
                <small>8–15 min typical prep</small>
              </div>
            </div>
            <div className="floating-tag tag-bottom">
              <div className="token-mini">
                <CheckCircle2 size={19} />
              </div>
              <div>
                <small>YOUR PICKUP TOKEN</small>
                <b>SC-0248 · Preparing</b>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="benefits">
        <div>
          <span className="benefit-icon blue">
            <Clock3 />
          </span>
          <div>
            <b>Less waiting</b>
            <p>Order before you arrive at the counter</p>
          </div>
        </div>
        <div>
          <span className="benefit-icon orange">
            <ShoppingBag />
          </span>
          <div>
            <b>Easy ordering</b>
            <p>Your campus favourites in a few taps</p>
          </div>
        </div>
        <div>
          <span className="benefit-icon green">
            <CheckCircle2 />
          </span>
          <div>
            <b>Live order updates</b>
            <p>Know the exact moment your food is ready</p>
          </div>
        </div>
      </section>

      <section className="landing-bottom">
        <div>
          <div className="eyebrow">YOUR BREAK, UPGRADED</div>
          <h2>
            More time for what
            <br />
            matters on campus.
          </h2>
          <p>Browse today's live menu, place your order, and collect it with your digital token.</p>
        </div>
        <Link to="/menu" className="btn btn-primary">
          See what's cooking <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}

function Auth({ mode }: { mode: 'signup' | 'login' | 'admin' }) {
  const signup = mode === 'signup';
  const admin = mode === 'admin';
  const { setToast, setProfile, quickLogin } = useApp();
  const [email, setEmail] = useState(admin ? 'admin@campus.edu' : mode === 'login' ? 'student@campus.edu' : '');
  const [password, setPassword] = useState(admin ? 'admin123' : mode === 'login' ? 'password123' : '');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const nav = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (signup) {
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, student_id: studentId || null } },
        });
        if (signUpErr) throw signUpErr;
        if (!data.session) {
          setToast('Account created! Please sign in.');
          nav('/login');
          return;
        }
        const p = await api('/me');
        setProfile(p);
        setToast(`Welcome to smartQ, ${p.full_name}!`);
        nav('/home');
      } else {
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;
        const p = await api('/me');
        if (admin && p.role !== 'admin') {
          await supabase.auth.signOut();
          throw new Error('This account is not authorized as a canteen admin.');
        }
        setProfile(p);
        setToast(`Welcome back, ${p.full_name}`);
        if (!admin && p.role === 'admin') nav('/admin');
        else nav(admin ? '/admin' : '/home');
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-aside">
        <div className="eyebrow light">smartQ · SMART CANTEEN</div>
        <h2>
          {admin
            ? 'The canteen, in control.'
            : signup
              ? 'Your next favourite meal is a tap away.'
              : 'Your break starts here.'}
        </h2>
        <p>
          {admin
            ? 'Manage incoming orders, update food availability, and keep the pickup queue moving smoothly.'
            : 'Less queue. More you. Browse the live menu and order ahead from anywhere on campus.'}
        </p>
        <div className="auth-aside-card">
          <div>
            <b>{admin ? 'One dashboard. Every order.' : 'A little more time, every day.'}</b>
            <small>
              {admin
                ? 'Real-time order visibility and menu controls for your kitchen team.'
                : 'Track your token from kitchen preparation to counter pickup.'}
            </small>
          </div>
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-icon">
          <UtensilsCrossed />
        </div>
        <div className="eyebrow">{admin ? 'STAFF ACCESS' : signup ? 'GET STARTED' : 'WELCOME BACK'}</div>
        <h1>{admin ? 'Admin sign in' : signup ? 'Create your account' : 'Sign in to smartQ'}</h1>
        <p className="muted">
          {admin
            ? 'Only authorized canteen managers can sign in here.'
            : signup
              ? 'Join your campus canteen, minus the queue.'
              : 'Pick up where your appetite left off.'}
        </p>

        {!signup && (
          <div className="demo-creds-banner">
            <div>
              <b>Demo {admin ? 'Admin' : 'Student'} Account Pre-filled</b>
              <span>
                {admin ? 'admin@campus.edu / admin123' : 'student@campus.edu / password123'}
              </span>
            </div>
            <button
              type="button"
              className="btn btn-light btn-sm"
              onClick={() => quickLogin(admin ? 'admin' : 'student')}
            >
              One-click sign in
            </button>
          </div>
        )}

        <form onSubmit={submit} className="form-stack">
          {signup && (
            <>
              <label>
                Full name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Aarav Sharma"
                />
              </label>
              <label>
                Student ID <span className="muted">(optional)</span>
                <input
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. 22CSE104"
                />
              </label>
            </>
          )}
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@campus.edu"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
            />
          </label>
          {error && <div className="error-box">{error}</div>}
          <button disabled={busy} className="btn btn-primary btn-lg full">
            {busy
              ? 'Please wait…'
              : signup
                ? 'Create student account'
                : admin
                  ? 'Sign in as admin'
                  : 'Sign in'}{' '}
            <ArrowRight size={17} />
          </button>
        </form>

        {signup ? (
          <p className="auth-switch">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        ) : !admin ? (
          <p className="auth-switch">
            New to SmartQueue? <Link to="/signup">Create an account</Link> ·{' '}
            <Link to="/admin-login">Admin login</Link>
          </p>
        ) : (
          <p className="auth-switch">
            Student? <Link to="/login">Go to student login</Link>
          </p>
        )}
      </div>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-title">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

function Home() {
  const { profile, setToast } = useApp();
  const [items, setItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [m, o, n] = await Promise.all([api('/menu'), api('/orders/mine'), api('/notifications')]);
      setItems(m);
      setOrders(o.filter((x: any) => !['Completed', 'Cancelled'].includes(x.status)).slice(0, 3));
      setNotifs(n.slice(0, 3));
    } catch (e: any) {
      setToast(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  async function markRead(id: string) {
    try {
      await api(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifs((old) => old.map((x) => (x.id === id ? { ...x, is_read: true } : x)));
    } catch (e: any) {
      setToast(e.message);
    }
  }

  return (
    <>
      <section className="welcome-banner">
        <div>
          <div className="eyebrow light">YOUR CAMPUS, YOUR TABLE</div>
          <h1>Hey, {profile?.full_name?.split(' ')[0] || 'there'}</h1>
          <p>Hungry? Your next campus favourite is ready to order.</p>
          <Link to="/menu" className="btn btn-white">
            Order something good <ArrowRight size={16} />
          </Link>
        </div>
        <div className="welcome-illustration" aria-hidden="true">
          <span>🥪</span>
          <span>🥤</span>
          <span>🍜</span>
        </div>
      </section>

      <div className="quick-stats">
        <div>
          <span className="stat-icon">
            <ShoppingBag />
          </span>
          <div>
            <small>Active orders</small>
            <b>{orders.length}</b>
          </div>
        </div>
        <div>
          <span className="stat-icon green">
            <CheckCircle2 />
          </span>
          <div>
            <small>Available items</small>
            <b>{items.filter((i) => i.is_available).length}</b>
          </div>
        </div>
        <div>
          <span className="stat-icon orange">
            <Clock3 />
          </span>
          <div>
            <small>Typical prep time</small>
            <b>8–15 min</b>
          </div>
        </div>
      </div>

      {orders.length > 0 && (
        <section className="content-section">
          <div className="row-between">
            <h2>Your active orders</h2>
            <Link to="/orders" className="text-link">
              View all <ArrowRight size={15} />
            </Link>
          </div>
          <div className="order-strip">
            {orders.map((o) => (
              <Link to={`/orders/${o.id}`} className="active-order" key={o.id}>
                <div className="order-token">
                  <small>TOKEN</small>
                  <b>{o.token_number}</b>
                </div>
                <div>
                  <span className={`status ${statusClass(o.status)}`}>{o.status}</span>
                  <p>
                    {money(o.total_amount)} ·{' '}
                    {new Date(o.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <ArrowRight size={18} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {notifs.length > 0 && (
        <section className="content-section">
          <div className="row-between">
            <h2>Recent updates</h2>
          </div>
          <div className="notif-list">
            {notifs.map((n) => (
              <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                <div>
                  <b>
                    <Bell size={13} style={{ display: 'inline', marginRight: 6 }} />
                    {n.title}
                  </b>
                  <p>{n.message}</p>
                </div>
                {!n.is_read && (
                  <button className="btn btn-light btn-sm" onClick={() => markRead(n.id)}>
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="content-section">
        <div className="row-between">
          <div>
            <div className="eyebrow">THE CROWD FAVOURITES</div>
            <h2>Popular on campus</h2>
          </div>
          <Link to="/menu" className="text-link">
            Full menu <ArrowRight size={15} />
          </Link>
        </div>
        {loading ? (
          <SkeletonGrid />
        ) : (
          <div className="food-grid">
            {items
              .filter((i) => i.is_featured)
              .slice(0, 4)
              .map((i) => (
                <FoodCard key={i.id} item={i} />
              ))}
          </div>
        )}
      </section>

      <section className="tip-banner">
        <div className="tip-icon">✦</div>
        <div>
          <b>Beat the lunch rush</b>
          <p>Place your order a few minutes early and keep an eye on your digital token status.</p>
        </div>
        <Link to="/menu" className="text-link">
          Order ahead <ArrowRight size={15} />
        </Link>
      </section>
    </>
  );
}

function SkeletonGrid() {
  return (
    <div className="food-grid">
      {[1, 2, 3, 4].map((n) => (
        <div className="skeleton-card" key={n}>
          <div />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}

function FoodCard({ item }: { item: any }) {
  const { cart, setCart, setToast, session, quickLogin } = useApp();
  const qty = cart.find((x) => x.id === item.id)?.qty || 0;

  async function add() {
    if (!item.is_available) return;
    if (!session) {
      await quickLogin('student');
    }
    setCart((old) => {
      const exists = old.find((x) => x.id === item.id);
      return exists
        ? old.map((x) => (x.id === item.id ? { ...x, qty: Math.min(30, x.qty + 1) } : x))
        : [...old, { ...item, qty: 1 }];
    });
    setToast(`${item.name} added to cart`);
  }

  return (
    <article className={`food-card ${!item.is_available ? 'unavailable' : ''}`}>
      <div className="food-image">
        <img
          src={item.image_url || HERO_FALLBACK_IMAGE}
          alt={item.name}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <span className={`availability ${item.is_available ? 'available' : 'soldout'}`}>
          {item.is_available ? 'Available' : 'Sold out'}
        </span>
        {item.is_featured && (
          <span className="featured-badge">
            <Flame size={12} /> Popular
          </span>
        )}
      </div>
      <div className="food-body">
        <div className="food-meta">
          <span>{item.category}</span>
          <span
            className="veg-dot"
            title={item.is_vegetarian ? 'Vegetarian' : 'Non-vegetarian'}
          >
            {item.is_vegetarian === true ? 'V' : item.is_vegetarian === false ? 'N' : '•'}
          </span>
        </div>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <div className="food-bottom">
          <div>
            <b>{money(item.price)}</b>
            <small>
              <Clock3 size={12} />
              {item.preparation_time_minutes} min
            </small>
          </div>
          <button
            className={qty ? 'add-btn added' : 'add-btn'}
            disabled={!item.is_available}
            onClick={add}
            aria-label={`Add ${item.name} to cart`}
          >
            {qty ? `+ ${qty}` : <Plus size={18} />}
          </button>
        </div>
      </div>
    </article>
  );
}

function MenuPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [availability, setAvailability] = useState('all');
  const [loading, setLoading] = useState(true);
  const { setToast, cart } = useApp();

  useEffect(() => {
    Promise.all([api('/menu'), api('/categories')])
      .then(([m, c]) => {
        setItems(m);
        setCategories(c.map((x: any) => x.name));
      })
      .catch((e) => setToast(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(
    (i) =>
      (cat === 'All' || i.category === cat) &&
      (!q || `${i.name} ${i.description || ''}`.toLowerCase().includes(q.toLowerCase())) &&
      (availability === 'all' || (availability === 'available' ? i.is_available : !i.is_available))
  );

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <SectionTitle
        eyebrow="MADE FRESH, ORDERED EASY"
        title="The campus menu"
        description="Good food, fair prices, no queue. Find your craving."
        action={
          cartCount > 0 ? (
            <Link to="/cart" className="btn btn-primary">
              <ShoppingBag size={16} /> View Cart ({cartCount}) <ArrowRight size={16} />
            </Link>
          ) : undefined
        }
      />
      <div className="menu-tools">
        <div className="search-box">
          <Search size={18} />
          <input
            aria-label="Search menu items"
            placeholder="Search dosa, coffee, snacks…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q && (
            <button type="button" onClick={() => setQ('')}>
              Clear
            </button>
          )}
        </div>
        <select
          aria-label="Filter by availability"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        >
          <option value="all">All availability</option>
          <option value="available">Available now</option>
          <option value="soldout">Sold out</option>
        </select>
      </div>
      <div className="category-pills" role="tablist" aria-label="Menu categories">
        <button className={cat === 'All' ? 'active' : ''} onClick={() => setCat('All')}>
          All items
        </button>
        {categories.map((c) => (
          <button key={c} className={cat === c ? 'active' : ''} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>
      {loading ? (
        <SkeletonGrid />
      ) : filtered.length ? (
        <div className="food-grid">
          {filtered.map((i) => (
            <FoodCard key={i.id} item={i} />
          ))}
        </div>
      ) : (
        <Empty title="No items found" text="Try a different search or category." />
      )}
    </>
  );
}

function Cart() {
  const { cart, setCart } = useApp();
  const change = (id: string, qty: number) =>
    setCart((old) =>
      qty < 1
        ? old.filter((i) => i.id !== id)
        : old.map((i) => (i.id === id ? { ...i, qty: Math.min(30, qty) } : i))
    );
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <>
      <SectionTitle
        eyebrow="YOUR ORDER"
        title="Your cart"
        description="One last check before your food gets cooking."
        action={
          <Link to="/menu" className="btn btn-light">
            ← Back to menu
          </Link>
        }
      />
      {!cart.length ? (
        <Empty
          title="Your cart is taking a break"
          text="Add a few campus favourites and they'll show up here."
          action={
            <Link to="/menu" className="btn btn-primary">
              Explore menu <ArrowRight size={16} />
            </Link>
          }
        />
      ) : (
        <div className="checkout-layout">
          <div className="cart-items">
            {cart.map((i) => (
              <div className="cart-item" key={i.id}>
                <img src={i.image_url || HERO_FALLBACK_IMAGE} alt={i.name} referrerPolicy="no-referrer" />
                <div className="cart-item-main">
                  <b>{i.name}</b>
                  <small>{money(i.price)} each</small>
                  <span className="cart-line-total">{money(i.price * i.qty)}</span>
                </div>
                <div className="quantity">
                  <button
                    type="button"
                    onClick={() => change(i.id, i.qty - 1)}
                    aria-label={`Decrease quantity of ${i.name}`}
                  >
                    <Minus size={14} />
                  </button>
                  <b>{i.qty}</b>
                  <button
                    type="button"
                    onClick={() => change(i.id, i.qty + 1)}
                    disabled={i.qty >= 30}
                    aria-label={`Increase quantity of ${i.name}`}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  type="button"
                  className="icon-btn danger"
                  onClick={() => change(i.id, 0)}
                  aria-label={`Remove ${i.name} from cart`}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
          <OrderSummary
            cart={cart}
            total={total}
            button={
              <Link to="/checkout" className="btn btn-primary btn-lg full">
                Continue to checkout <ArrowRight size={17} />
              </Link>
            }
          />
        </div>
      )}
    </>
  );
}

function OrderSummary({
  cart,
  total,
  button,
}: {
  cart: any[];
  total: number;
  button: React.ReactNode;
}) {
  return (
    <aside className="summary-card">
      <h3>Order summary</h3>
      {cart.map((i) => (
        <div className="summary-line" key={i.id}>
          <span>
            {i.name} × {i.qty}
          </span>
          <b>{money(i.price * i.qty)}</b>
        </div>
      ))}
      <div className="summary-line">
        <span>Pickup</span>
        <b className="green-text">At canteen counter</b>
      </div>
      <div className="summary-total">
        <span>Total</span>
        <b>{money(total)}</b>
      </div>
      <p className="summary-note">
        <CheckCircle2 size={15} /> Prices confirmed by the canteen server at checkout.
      </p>
      {button}
    </aside>
  );
}

function Checkout() {
  const { cart, setCart, setToast, profile } = useApp();
  const nav = useNavigate();
  const [customerName, setCustomerName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [campusLocation, setCampusLocation] = useState(CAMPUS_LOCATIONS[0]);
  const [orderNotes, setOrderNotes] = useState('');
  const [pickup, setPickup] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  // const [paymentMethod, setPaymentCompleted] = useState(false);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // Sync with profile when loaded
  useEffect(() => {
    if (profile?.full_name && !customerName) {
      setCustomerName(profile.full_name);
    }
    if (profile?.phone && !phone) {
      setPhone(profile.phone);
    }
  }, [profile]);

  async function place(e: React.FormEvent) {
    e.preventDefault();
    if (!cart.length || busy) return;

    if (!customerName.trim()) {
      setError('Please provide your full name for order pickup.');
      return;
    }
    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      setError('Please provide a valid contact phone number.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const result = await api('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: cart.map((i) => ({ menuItemId: i.id, quantity: i.qty })),
          paymentMethod: 'PAY_AT_COUNTER',
          customerName: customerName.trim(),
          phone: phone.trim(),
          campusLocation,
          orderNotes: orderNotes.trim(),
          pickupSlot: pickup ? new Date(pickup).toISOString() : null,
        }),
      });
      setCart([]);
      setToast(`Order placed! Token: ${result.tokenNumber}`);
      nav(`/orders/${result.id}`, { state: { confirmation: result } });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!cart.length)
    return (
      <Empty
        title="Nothing to checkout"
        text="Your cart is empty. Pick your campus favorites from the menu."
        action={
          <Link to="/menu" className="btn btn-primary">
            Browse menu
          </Link>
        }
      />
    );

  return (
    <>
      <SectionTitle
        eyebrow="CAMPUS DINING CHECKOUT"
        title="Checkout & Pickup"
        description="Verify your campus location and order details before cooking begins."
      />
      <form onSubmit={place} className="checkout-layout">
        <div className="checkout-main">
          {/* Customer & Location Details */}
          <div className="panel">
            <h3>1. Contact & Campus Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <label>
                Student / Customer name <span className="text-red-500">*</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </label>
              <label>
                Contact phone number <span className="text-red-500">*</span>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
            </div>
            <label className="mt-4 block">
              Pickup / Campus location
              <select
                value={campusLocation}
                onChange={(e) => setCampusLocation(e.target.value as any)}
                className="mt-1"
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </label>
            <p className="form-hint mt-1">
              Select where you are located or where you will collect your order.
            </p>
          </div>

          {/* Kitchen Notes & Pickup Window */}
          <div className="panel">
            <h3>2. Kitchen notes & pickup schedule</h3>
            <label>
              Order notes / Special instructions <span className="muted">(optional)</span>
              <textarea
                placeholder="e.g. Extra coconut chutney, mild spicy, call on arrival..."
                maxLength={300}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={3}
              />
              <span className="text-xs text-muted block text-right">
                {300 - orderNotes.length} characters left
              </span>
            </label>

            <label className="mt-4 block">
              Preferred pickup time <span className="muted">(optional)</span>
              <input
                type="datetime-local"
                value={pickup}
                min={new Date(Date.now() + 5 * 60000).toISOString().slice(0, 16)}
                onChange={(e) => setPickup(e.target.value)}
              />
            </label>
            <p className="form-hint">
              Leave blank for immediate kitchen preparation (~10-15 minutes).
            </p>
          </div>

          {/* Transparent Payment Selection */}


          {/* Payment Selection */}
          <div className="panel">
            <h3>3. Payment method</h3>

            <label className="payment-choice cursor-pointer">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'CASH'}
                onChange={() => setPaymentMethod('CASH')}
              />
              <span className="payment-symbol">₹</span>
              <span>
                <b>Cash on pickup</b>
                <small>Pay at the canteen counter.</small>
              </span>
            </label>

            <label className="payment-choice cursor-pointer mt-3">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'UPI'}
                onChange={() => setPaymentMethod('UPI')}
              />
              <span className="payment-symbol">₹</span>
              <span>
                <b>UPI Payment</b>
                <small>Scan the QR code to pay.</small>
              </span>
            </label>

            {paymentMethod === 'UPI' && (
              <div className="mt-4 text-center">
                <img
                  src="/upi-qr.jpg"
                  alt="UPI QR Code"
                  style={{
                    width: '220px',
                    maxWidth: '100%',
                    margin: '15px auto',
                    borderRadius: '12px'
                  }}
                />
              </div>
            )}
          </div>

          {error && <div className="error-box">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-lg full"
            disabled={busy}
          >
            {busy ? (
              'Placing your order…'
            ) : (
              <>
                Place order · {money(total)} <ArrowRight size={17} />
              </>
            )}
          </button>
        </div>

        <OrderSummary cart={cart} total={total} button={null} />
      </form>
    </>
  );
}

function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { setToast } = useApp();

  async function load() {
    try {
      setOrders(await api('/orders/mine'));
    } catch (e: any) {
      setToast(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <SectionTitle
        eyebrow="YOUR FOOD, YOUR TOKENS"
        title="My orders"
        description="Follow your order from the kitchen to the pickup counter."
        action={
          <button className="btn btn-light" onClick={load}>
            <RefreshCw size={15} /> Refresh
          </button>
        }
      />
      {loading ? (
        <div className="center-state">
          <div className="spinner" />
        </div>
      ) : orders.length ? (
        <div className="orders-list">
          {orders.map((o) => (
            <Link to={`/orders/${o.id}`} key={o.id} className="order-row">
              <div className="order-token">
                <small>PICKUP TOKEN</small>
                <b>{o.token_number}</b>
              </div>
              <div className="order-row-info">
                <span className={`status ${statusClass(o.status)}`}>{o.status}</span>
                <small>{new Date(o.created_at).toLocaleString()}</small>
              </div>
              <b>{money(o.total_amount)}</b>
              <ArrowRight size={18} />
            </Link>
          ))}
        </div>
      ) : (
        <Empty
          title="No orders yet"
          text="Your first campus meal is just a few taps away."
          action={
            <Link to="/menu" className="btn btn-primary">
              Browse menu <ArrowRight size={16} />
            </Link>
          }
        />
      )}
    </>
  );
}

function OrderHistory() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'active' | 'cancelled'>('all');
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const { setCart, setToast } = useApp();
  const nav = useNavigate();

  async function load() {
    try {
      setOrders(await api('/orders/mine'));
    } catch (e: any) {
      setToast(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleReorder(o: any) {
    setReorderingId(o.id);
    try {
      const res = await api(`/orders/${o.id}/reorder`, { method: 'POST' });
      if (!res.availableItems || res.availableItems.length === 0) {
        setToast('All items in this order are currently sold out or unavailable.');
        return;
      }
      setCart(res.availableItems);
      if (res.unavailableItemNames && res.unavailableItemNames.length > 0) {
        setToast(`Loaded ${res.availableItems.length} items (${res.unavailableItemNames.join(', ')} sold out).`);
      } else {
        setToast(`Loaded ${res.availableItems.length} items from ${o.token_number} into cart!`);
      }
      nav('/cart');
    } catch (e: any) {
      setToast(e.message || 'Could not reorder');
    } finally {
      setReorderingId(null);
    }
  }

  const filtered = orders.filter((o) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return o.status === 'Completed';
    if (filter === 'cancelled') return o.status === 'Cancelled';
    if (filter === 'active')
      return ['Pending', 'Accepted', 'Preparing', 'Ready for Pickup'].includes(o.status);
    return true;
  });

  return (
    <>
      <SectionTitle
        eyebrow="PAST MEALS & FAVORITES"
        title="Order history"
        description="Review your past campus dining receipts and reorder your favorites in one tap."
        action={
          <button className="btn btn-light" onClick={load}>
            <RefreshCw size={15} /> Refresh
          </button>
        }
      />

      <div className="category-pills" role="tablist" aria-label="Order history filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All ({orders.length})
        </button>
        <button
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          Completed ({orders.filter((o) => o.status === 'Completed').length})
        </button>
        <button
          className={filter === 'active' ? 'active' : ''}
          onClick={() => setFilter('active')}
        >
          Active ({orders.filter((o) => ['Pending', 'Accepted', 'Preparing', 'Ready for Pickup'].includes(o.status)).length})
        </button>
        <button
          className={filter === 'cancelled' ? 'active' : ''}
          onClick={() => setFilter('cancelled')}
        >
          Cancelled ({orders.filter((o) => o.status === 'Cancelled').length})
        </button>
      </div>

      {loading ? (
        <div className="center-state">
          <div className="spinner" />
          <p>Loading your order history…</p>
        </div>
      ) : filtered.length ? (
        <div className="history-grid">
          {filtered.map((o) => (
            <div className="history-card" key={o.id}>
              <div className="history-header">
                <div>
                  <span className="history-token">TOKEN: {o.token_number}</span>
                  <div className="history-meta">
                    <span>
                      {new Date(o.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      ·{' '}
                      {new Date(o.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {o.campus_location && (
                      <span className="history-loc">
                        <MapPin size={12} /> {o.campus_location}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`status ${statusClass(o.status)}`}>{o.status}</span>
              </div>

              <div className="history-items">
                {(o.items || []).map((it: any, idx: number) => (
                  <div className="history-item-line" key={idx}>
                    <span>
                      {it.item_name} <small>× {it.quantity}</small>
                    </span>
                    <b className="tabular-nums">{money(it.subtotal)}</b>
                  </div>
                ))}
              </div>

              {o.order_notes && (
                <div className="history-notes">
                  <FileText size={12} />
                  <span>Note: {o.order_notes}</span>
                </div>
              )}

              <div className="history-footer">
                <div className="history-total">
                  <small>TOTAL</small>
                  <b className="tabular-nums">{money(o.total_amount)}</b>
                </div>
                <div className="history-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleReorder(o)}
                    disabled={reorderingId === o.id}
                  >
                    <RotateCcw size={14} />
                    {reorderingId === o.id ? 'Loading…' : 'Reorder items'}
                  </button>
                  <Link to={`/orders/${o.id}`} className="btn btn-light btn-sm">
                    View receipt <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          title="No orders found"
          text={
            filter === 'all'
              ? "You haven't placed any orders yet. Discover today's canteen specials."
              : `No ${filter} orders found in your history.`
          }
          action={
            <Link to="/menu" className="btn btn-primary">
              Browse menu <ArrowRight size={16} />
            </Link>
          }
        />
      )}
    </>
  );
}

function OrderDetail() {
  const location = useLocation();
  const id = location.pathname.split('/').pop();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const { setToast, setCart } = useApp();
  const nav = useNavigate();

  async function load() {
    try {
      setOrder(await api(`/orders/${id}`));
    } catch (e: any) {
      setToast(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [id]);

  async function cancel() {
    setBusy(true);
    try {
      await api(`/orders/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Cancelled by student' }),
      });
      setToast('Order cancelled');
      setConfirmCancel(false);
      load();
    } catch (e: any) {
      setToast(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function reorderThis() {
    setBusy(true);
    try {
      const res = await api(`/orders/${id}/reorder`, { method: 'POST' });
      if (!res.availableItems || res.availableItems.length === 0) {
        setToast('All items in this order are currently sold out.');
        return;
      }
      setCart(res.availableItems);
      if (res.unavailableItemNames && res.unavailableItemNames.length > 0) {
        setToast(`Loaded ${res.availableItems.length} items (${res.unavailableItemNames.join(', ')} sold out).`);
      } else {
        setToast(`Loaded items from token ${order?.token_number} into cart!`);
      }
      nav('/cart');
    } catch (e: any) {
      setToast(e.message || 'Could not reorder');
    } finally {
      setBusy(false);
    }
  }

  const steps = ['Pending', 'Accepted', 'Preparing', 'Ready for Pickup', 'Completed'];
  const current = steps.indexOf(order?.status);

  if (loading)
    return (
      <div className="center-state">
        <div className="spinner" />
        <p>Loading your order…</p>
      </div>
    );
  if (!order)
    return (
      <Empty
        title="Order not found"
        text="This order may have been removed or is not available."
      />
    );

  return (
    <>
      <SectionTitle
        eyebrow="ORDER TRACKING"
        title="Your order status"
        description="We'll keep this page updated as the canteen prepares your food."
        action={
          <div className="flex gap-2">
            <Link to="/orders" className="btn btn-light">
              Active orders
            </Link>
            <Link to="/history" className="btn btn-light">
              Order history
            </Link>
          </div>
        }
      />
      <div className="token-hero">
        <div>
          <span className="eyebrow light">YOUR DIGITAL PICKUP TOKEN</span>
          <div className="big-token">{order.token_number}</div>
          <p>Show this token at the canteen counter when collecting your food.</p>
        </div>
        <div className="token-check">
          <CheckCircle2 size={35} />
          <span>{order.status}</span>
        </div>
      </div>

      {order.status !== 'Cancelled' ? (
        <div className="panel tracking-panel">
          <h3>Order progress</h3>
          <div className="timeline">
            {steps.map((s, i) => (
              <div
                key={s}
                className={`timeline-step ${i <= current ? 'done' : ''} ${i === current ? 'current' : ''
                  }`}
              >
                <span className="timeline-dot">
                  {i < current ? <CheckCircle2 size={15} /> : i + 1}
                </span>
                <div>
                  <b>{s}</b>
                  <small>{i === current ? 'Current status' : i < current ? 'Completed' : ''}</small>
                </div>
              </div>
            ))}
          </div>
          <p className="form-hint">
            <Clock3 size={15} /> Estimated ready:{' '}
            {order.estimated_ready_at
              ? new Date(order.estimated_ready_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
              : 'Being calculated'}
          </p>
        </div>
      ) : (
        <div className="error-box">Order cancelled. {order.cancellation_reason || ''}</div>
      )}

      <div className="checkout-layout order-detail-layout">
        <div className="panel">
          <h3>Items ordered</h3>
          {(order.items || []).map((i: any, n: number) => (
            <div className="summary-line" key={n}>
              <span>
                {i.item_name} × {i.quantity}
              </span>
              <b>{money(i.subtotal)}</b>
            </div>
          ))}
          <div className="summary-total">
            <span>Total</span>
            <b>{money(order.total_amount)}</b>
          </div>
        </div>

        <div className="panel">
          <h3>Pickup details</h3>
          <div className="detail-line">
            <span>Customer</span>
            <b>{order.student_name || 'Student'}</b>
          </div>
          {order.phone && (
            <div className="detail-line">
              <span>Phone</span>
              <b>{order.phone}</b>
            </div>
          )}
          {order.campus_location && (
            <div className="detail-line">
              <span>Campus location</span>
              <b>{order.campus_location}</b>
            </div>
          )}
          {order.order_notes && (
            <div className="detail-line">
              <span>Kitchen notes</span>
              <b>{order.order_notes}</b>
            </div>
          )}
          <div className="detail-line">
            <span>Payment</span>
            <b>Pay at counter ({order.payment_status})</b>
          </div>
          <div className="detail-line">
            <span>Placed</span>
            <b>{new Date(order.created_at).toLocaleString()}</b>
          </div>
          {order.pickup_slot && (
            <div className="detail-line">
              <span>Preferred pickup</span>
              <b>{new Date(order.pickup_slot).toLocaleString()}</b>
            </div>
          )}

          {['Pending', 'Accepted'].includes(order.status) && !confirmCancel && (
            <button
              type="button"
              className="btn btn-danger full"
              style={{ marginTop: 14 }}
              onClick={() => setConfirmCancel(true)}
              disabled={busy}
            >
              Cancel order
            </button>
          )}

          {['Completed', 'Cancelled'].includes(order.status) && (
            <button
              type="button"
              className="btn btn-primary full"
              style={{ marginTop: 14 }}
              onClick={reorderThis}
              disabled={busy}
            >
              <RotateCcw size={15} /> Reorder this meal
            </button>
          )}

          {confirmCancel && (
            <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn btn-danger full"
                onClick={cancel}
                disabled={busy}
              >
                {busy ? 'Cancelling…' : 'Confirm cancellation'}
              </button>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setConfirmCancel(false)}
              >
                Keep order
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Profile() {
  const { profile, setProfile, setToast, logout, session } = useApp();
  const [name, setName] = useState(profile?.full_name || '');
  const [studentId, setStudentId] = useState(profile?.student_id || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const p = await api('/me', {
        method: 'PUT',
        body: JSON.stringify({ fullName: name, studentId, phone }),
      });
      setProfile(p);
      setToast('Profile updated');
    } catch (e: any) {
      setToast(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SectionTitle
        eyebrow="YOUR ACCOUNT"
        title="Profile"
        description="Your details for a smoother campus pickup."
      />
      <div className="profile-layout">
        <div className="profile-card">
          <div className="profile-avatar">
            {(profile?.full_name || 'S').charAt(0).toUpperCase()}
          </div>
          <h2>{profile?.full_name}</h2>
          <p>{profile?.role === 'admin' ? 'Canteen manager' : 'Student account'}</p>
          <div className="profile-email">{session?.user?.email || profile?.email}</div>
          <button className="btn btn-ghost full" onClick={logout}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
        <form className="panel profile-form" onSubmit={save}>
          <h3>Personal information</h3>
          <label>
            Full name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Email address
            <input value={session?.user?.email || ''} readOnly disabled />
          </label>
          <label>
            Student ID
            <input
              value={studentId || ''}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Optional"
            />
          </label>
          <label>
            Phone number
            <input
              value={phone || ''}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Optional"
            />
          </label>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </>
  );
}

function AdminLayout({ children, active }: { children: React.ReactNode; active: string }) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="eyebrow">CANTEEN OPERATIONS</div>
        <Link className={active === 'dashboard' ? 'active' : ''} to="/admin">
          <LayoutDashboard size={17} /> Dashboard
        </Link>
        <Link className={active === 'orders' ? 'active' : ''} to="/admin/orders">
          <ClipboardList size={17} /> Orders
        </Link>
        <Link className={active === 'menu' ? 'active' : ''} to="/admin/menu">
          <ChefHat size={17} /> Food menu
        </Link>
        <Link className={active === 'reports' ? 'active' : ''} to="/admin/reports">
          <BarChart3 size={17} /> Reports & sales
        </Link>
        <div className="sidebar-note">
          <b>Keep the queue moving</b>
          <small>Orders and metrics update from the live canteen server.</small>
        </div>
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const { setToast } = useApp();

  async function load() {
    try {
      const [s, o] = await Promise.all([api('/admin/dashboard'), api('/admin/orders')]);
      setStats(s);
      setOrders(o.slice(0, 6));
    } catch (e: any) {
      setToast(e.message);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, []);

  const cards: Array<[string, any, any, string]> = [
    ['Orders today', stats?.total_today ?? '—', ClipboardList, 'blue'],
    ['Pending', stats?.pending ?? '—', Clock3, 'yellow'],
    ['Preparing', stats?.preparing ?? '—', ChefHat, 'orange'],
    ['Ready for pickup', stats?.ready ?? '—', CheckCircle2, 'green'],
    ['Completed', stats?.completed ?? '—', CheckCircle2, 'darkgreen'],
    ['Cancelled', stats?.cancelled ?? '—', X, 'red'],
  ];

  return (
    <AdminLayout active="dashboard">
      <SectionTitle
        eyebrow="OVERVIEW"
        title="Canteen dashboard"
        description="A live snapshot of today's canteen activity."
        action={
          <button className="btn btn-light" onClick={load}>
            <RefreshCw size={15} /> Refresh
          </button>
        }
      />
      <div className="admin-stats">
        {cards.map(([label, val, Icon, color]) => (
          <div className="admin-stat" key={label}>
            <span className={`admin-stat-icon ${color}`}>
              <Icon size={19} />
            </span>
            <small>{label}</small>
            <b>{val}</b>
          </div>
        ))}
      </div>
      <div className="sales-highlight">
        <div>
          <span className="eyebrow light">COMPLETED SALES TODAY</span>
          <h2>{stats ? money(stats.sales_today) : '—'}</h2>
          <p>Calculated from completed orders in the database.</p>
        </div>
        <BarChart3 size={44} />
      </div>
      <div className="row-between section-gap">
        <h2>Recent orders</h2>
        <Link to="/admin/orders" className="text-link">
          Manage orders <ArrowRight size={15} />
        </Link>
      </div>
      <div className="panel" style={{ marginTop: 12 }}>
        <OrderTable orders={orders} />
      </div>
    </AdminLayout>
  );
}

function OrderTable({
  orders,
  onStatus,
}: {
  orders: any[];
  onStatus?: (order: any, nextStatus: string) => void;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Token / Student</th>
            <th>Items</th>
            <th>Placed</th>
            <th>Amount</th>
            <th>Status</th>
            {onStatus && <th>Update status</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const nextOptions =
              o.status === 'Pending'
                ? ['Accepted', 'Cancelled']
                : o.status === 'Accepted'
                  ? ['Preparing', 'Cancelled']
                  : o.status === 'Preparing'
                    ? ['Ready for Pickup', 'Cancelled']
                    : o.status === 'Ready for Pickup'
                      ? ['Completed']
                      : [];
            return (
              <tr key={o.id}>
                <td>
                  <b>{o.token_number}</b>
                  <small className="table-sub">
                    {o.student_name || 'Student'}
                    {o.student_code ? ` · ${o.student_code}` : ''}
                  </small>
                  {o.phone && (
                    <small className="table-sub block text-xs text-slate-500">
                      {o.phone}
                    </small>
                  )}
                  {o.campus_location && (
                    <div style={{ fontSize: 11, color: '#1458d4', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <MapPin size={11} /> {o.campus_location}
                    </div>
                  )}
                  {o.order_notes && (
                    <div style={{ fontSize: 11, color: '#df7628', marginTop: 2 }}>
                      Note: {o.order_notes}
                    </div>
                  )}
                </td>
                <td>
                  {(o.items || []).map((it: any) => `${it.item_name} ×${it.quantity}`).join(', ') ||
                    '—'}
                </td>
                <td>
                  {new Date(o.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td>
                  <b>{money(o.total_amount)}</b>
                </td>
                <td>
                  <span className={`status ${statusClass(o.status)}`}>{o.status}</span>
                </td>
                {onStatus && (
                  <td>
                    <select
                      aria-label={`Update status for ${o.token_number}`}
                      value={o.status}
                      disabled={nextOptions.length === 0}
                      onChange={(e) => onStatus(o, e.target.value)}
                    >
                      <option value={o.status}>{o.status}</option>
                      {nextOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {!orders.length && (
        <Empty title="No orders to show" text="New student orders will appear here." />
      )}
    </div>
  );
}

function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [status, setStatus] = useState('All');
  const [q, setQ] = useState('');
  const [orderToCancel, setOrderToCancel] = useState<any>(null);
  const { setToast } = useApp();

  async function load() {
    try {
      const qs = new URLSearchParams();
      if (status !== 'All') qs.set('status', status);
      if (q) qs.set('q', q);
      setOrders(await api('/admin/orders?' + qs.toString()));
    } catch (e: any) {
      setToast(e.message);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 7000);
    return () => clearInterval(t);
  }, [status, q]);

  async function update(o: any, s: string) {
    if (s === o.status) return;
    if (s === 'Cancelled') {
      setOrderToCancel(o);
      return;
    }
    try {
      await api(`/admin/orders/${o.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: s,
          reason: null,
        }),
      });
      setToast(`Order ${o.token_number}: ${s}`);
      load();
    } catch (e: any) {
      setToast(e.message);
      load();
    }
  }

  async function confirmCancelOrder() {
    if (!orderToCancel) return;
    try {
      await api(`/admin/orders/${orderToCancel.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'Cancelled',
          reason: 'Cancelled by canteen manager',
        }),
      });
      setToast(`Order ${orderToCancel.token_number} cancelled`);
      setOrderToCancel(null);
      load();
    } catch (e: any) {
      setToast(e.message);
    }
  }

  return (
    <AdminLayout active="orders">
      <SectionTitle
        eyebrow="ORDER MANAGEMENT"
        title="Incoming orders"
        description="Accept, prepare, and complete orders as they move through the queue."
      />
      <div className="menu-tools">
        <div className="search-box">
          <Search size={18} />
          <input
            aria-label="Search orders by token or student"
            placeholder="Search token, student name or ID…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          aria-label="Filter orders by status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {[
            'All',
            'Pending',
            'Accepted',
            'Preparing',
            'Ready for Pickup',
            'Completed',
            'Cancelled',
          ].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      {orderToCancel && (
        <div className="panel" style={{ border: '1px solid #ef4444', background: '#fef2f2', marginBottom: 16 }}>
          <h3 style={{ color: '#991b1b', margin: '0 0 8px' }}>Confirm Order Cancellation</h3>
          <p style={{ color: '#7f1d1d', margin: '0 0 14px' }}>
            Are you sure you want to cancel order <b>{orderToCancel.token_number}</b> for {orderToCancel.student_name}? This action cannot be reversed.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-danger btn-sm" onClick={confirmCancelOrder}>
              Yes, cancel this order
            </button>
            <button className="btn btn-light btn-sm" onClick={() => setOrderToCancel(null)}>
              Keep order active
            </button>
          </div>
        </div>
      )}
      <div className="panel">
        <OrderTable orders={orders} onStatus={update} />
      </div>
    </AdminLayout>
  );
}

function AdminMenu() {
  const [items, setItems] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [edit, setEdit] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const { setToast } = useApp();

  async function load() {
    try {
      const [m, c] = await Promise.all([api('/menu'), api('/categories')]);
      setItems(m);
      setCats(c);
    } catch (e: any) {
      setToast(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      let imageUrl = String(f.get('imageUrl') || '').trim() || null;
      const imageFile = f.get('imageFile') as File | null;
      if (imageFile && imageFile.size > 0) {
        if (
          !['image/jpeg', 'image/png', 'image/webp'].includes(imageFile.type) ||
          imageFile.size > 5 * 1024 * 1024
        ) {
          throw new Error('Choose a JPG, PNG or WebP image under 5 MB.');
        }
        const path = `${crypto.randomUUID()}-${imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const { error: uploadError } = await supabase.storage.from('menu-images').upload(path, imageFile);
        if (uploadError) throw uploadError;
        imageUrl = supabase.storage.from('menu-images').getPublicUrl(path).data.publicUrl;
      }

      const payload = {
        name: f.get('name'),
        description: f.get('description'),
        categoryId: f.get('categoryId'),
        price: Number(f.get('price')),
        imageUrl,
        isAvailable: f.get('isAvailable') === 'on',
        isVegetarian:
          f.get('isVegetarian') === 'yes'
            ? true
            : f.get('isVegetarian') === 'no'
              ? false
              : null,
        preparationTimeMinutes: Number(f.get('prep')),
        isFeatured: f.get('isFeatured') === 'on',
      };

      await api(edit?.id ? `/admin/menu/${edit.id}` : '/admin/menu', {
        method: edit?.id ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      setToast(edit?.id ? 'Menu item updated' : 'Menu item added');
      setEdit(null);
      load();
    } catch (e: any) {
      setToast(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(i: any) {
    try {
      await api(`/admin/menu/${i.id}`, { method: 'DELETE' });
      setToast(`${i.name} deleted`);
      setItemToDelete(null);
      load();
    } catch (e: any) {
      setToast(e.message);
    }
  }

  return (
    <AdminLayout active="menu">
      <SectionTitle
        eyebrow="MENU MANAGEMENT"
        title="Food menu"
        description="Keep availability, prices, and preparation estimates up to date."
        action={
          <button className="btn btn-primary" onClick={() => setEdit({})}>
            <Plus size={17} /> Add item
          </button>
        }
      />

      {edit && (
        <form className="panel menu-editor" onSubmit={save}>
          <div className="row-between">
            <h3>{edit.id ? 'Edit menu item' : 'Add a menu item'}</h3>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setEdit(null)}
              aria-label="Close editor"
            >
              <X />
            </button>
          </div>
          <div className="editor-grid">
            <label>
              Food name
              <input name="name" defaultValue={edit.name || ''} required />
            </label>
            <label>
              Category
              <select
                name="categoryId"
                defaultValue={edit.category_id || cats[0]?.id}
                required
              >
                {cats.map((c) => (
                  <option value={c.id} key={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Price (₹)
              <input
                name="price"
                type="number"
                min="0.01"
                step=".01"
                defaultValue={edit.price || ''}
                required
              />
            </label>
            <label>
              Prep time (minutes)
              <input
                name="prep"
                type="number"
                min="1"
                max="240"
                defaultValue={edit.preparation_time_minutes || 10}
                required
              />
            </label>
            <label className="span-two">
              Description
              <textarea name="description" defaultValue={edit.description || ''} />
            </label>
            <label className="span-two">
              Image URL
              <input
                name="imageUrl"
                type="url"
                defaultValue={edit.image_url?.startsWith('http') ? edit.image_url : ''}
                placeholder="Public image URL (optional — auto-generates illustration if blank)"
              />
            </label>
            <label className="span-two">
              Or upload image (JPG, PNG, WebP · max 5 MB)
              <input name="imageFile" type="file" accept="image/jpeg,image/png,image/webp" />
            </label>
            <label>
              Diet type
              <select
                name="isVegetarian"
                defaultValue={
                  edit.is_vegetarian === true
                    ? 'yes'
                    : edit.is_vegetarian === false
                      ? 'no'
                      : 'na'
                }
              >
                <option value="na">Not specified</option>
                <option value="yes">Vegetarian</option>
                <option value="no">Non-vegetarian</option>
              </select>
            </label>
            <div className="check-stack">
              <label>
                <input
                  type="checkbox"
                  name="isAvailable"
                  defaultChecked={edit.is_available ?? true}
                />{' '}
                Available
              </label>
              <label>
                <input
                  type="checkbox"
                  name="isFeatured"
                  defaultChecked={edit.is_featured ?? false}
                />{' '}
                Featured item
              </label>
            </div>
          </div>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save menu item'}
          </button>
        </form>
      )}

      <div className="panel">
        {itemToDelete && (
          <div className="panel" style={{ border: '1px solid #ef4444', background: '#fef2f2', marginBottom: 18 }}>
            <h3 style={{ color: '#991b1b', margin: '0 0 8px' }}>Confirm Item Deletion</h3>
            <p style={{ color: '#7f1d1d', margin: '0 0 14px' }}>
              Are you sure you want to permanently remove <b>{itemToDelete.name}</b> from the menu?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-danger btn-sm" onClick={() => remove(itemToDelete)}>
                Yes, delete {itemToDelete.name}
              </button>
              <button className="btn btn-light btn-sm" onClick={() => setItemToDelete(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
        <div className="row-between">
          <h3>
            Current items <span className="count-pill">{items.length}</span>
          </h3>
          <button className="btn btn-light btn-sm" onClick={load}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
        <div className="admin-food-list">
          {items.map((i) => (
            <div className="admin-food-row" key={i.id}>
              <img
                src={i.image_url || HERO_FALLBACK_IMAGE}
                alt={i.name}
                referrerPolicy="no-referrer"
              />
              <div className="admin-food-info">
                <b>{i.name}</b>
                <small>
                  {i.category} · {i.preparation_time_minutes} min
                </small>
                <span className={i.is_available ? 'green-text' : 'red-text'}>
                  {i.is_available ? 'Available' : 'Sold out'}
                </span>
              </div>
              <b>{money(i.price)}</b>
              <button className="btn btn-light btn-sm" onClick={() => setEdit(i)}>
                Edit
              </button>
              <button
                className="icon-btn danger"
                onClick={() => setItemToDelete(i)}
                aria-label={`Delete ${i.name}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

function Reports() {
  const [report, setReport] = useState<any>(null);
  const [from, setFrom] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  );
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const { setToast } = useApp();

  async function load() {
    try {
      setReport(await api(`/admin/reports?from=${from}&to=${to}`));
    } catch (e: any) {
      setToast(e.message);
    }
  }

  useEffect(() => {
    load();
  }, [from, to]);

  return (
    <AdminLayout active="reports">
      <SectionTitle
        eyebrow="SALES & INSIGHTS"
        title="Reports and sales"
        description="Understand what sells and how the canteen is flowing."
      />
      <div className="report-filters panel">
        <label>
          From
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={to}
            min={from}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <button className="btn btn-primary" onClick={load}>
          <RefreshCw size={15} /> Update report
        </button>
      </div>
      {report && (
        <>
          <div className="report-cards">
            <div className="admin-stat">
              <small>Orders placed</small>
              <b>{report.totals.order_count}</b>
            </div>
            <div className="admin-stat">
              <small>Completed sales</small>
              <b>{money(report.totals.completed_sales)}</b>
            </div>
            <div className="admin-stat">
              <small>Cancellations</small>
              <b>{report.totals.cancellations}</b>
            </div>
            <div className="admin-stat">
              <small>Non-cancelled order value</small>
              <b>{money(report.totals.gross_non_cancelled_value)}</b>
            </div>
          </div>
          <div className="reports-grid">
            <div className="panel">
              <h3>Most ordered items</h3>
              {report.popularItems.length ? (
                report.popularItems.map((i: any, n: number) => (
                  <div className="popular-row" key={i.item_name}>
                    <span className="rank">{n + 1}</span>
                    <b>{i.item_name}</b>
                    <span>{i.quantity} sold</span>
                  </div>
                ))
              ) : (
                <p className="muted">No completed orders in this period yet.</p>
              )}
            </div>
            <div className="panel">
              <h3>Order status summary</h3>
              {report.statuses.map((s: any) => (
                <div className="status-report-row" key={s.status}>
                  <span className={`status ${statusClass(s.status)}`}>{s.status}</span>
                  <b>{s.count}</b>
                </div>
              ))}
            </div>
          </div>
          <p className="tiny-note">
            Completed sales include only orders marked Completed. Non-cancelled order value excludes cancelled orders.
          </p>
        </>
      )}
    </AdminLayout>
  );
}

function Empty({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <ShoppingBag size={25} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

export default App;
