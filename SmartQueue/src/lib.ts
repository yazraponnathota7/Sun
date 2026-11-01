export interface SessionUser {
  id: string;
  email: string;
}

export interface Session {
  access_token: string;
  user: SessionUser;
}

const SESSION_KEY = 'campusbite_session_v1';
const authListeners = new Set<(event: string, session: Session | null) => void>();

function readStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function writeStoredSession(session: Session | null) {
  try {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // ignore storage errors
  }
  for (const cb of authListeners) {
    cb(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
  }
}

export const supabase = {
  auth: {
    async getSession(): Promise<{ data: { session: Session | null } }> {
      return { data: { session: readStoredSession() } };
    },
    onAuthStateChange(callback: (event: string, session: Session | null) => void) {
      authListeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authListeners.delete(callback);
            },
          },
        },
      };
    },
    async signUp({
      email,
      password,
      options,
    }: {
      email: string;
      password: string;
      options?: { data?: { full_name?: string; student_id?: string | null } };
    }) {
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            fullName: options?.data?.full_name || 'Student',
            studentId: options?.data?.student_id || null,
          }),
        });
        const body = await res.json();
        if (!res.ok) {
          return { data: { session: null }, error: new Error(body.message || 'Sign up failed') };
        }
        writeStoredSession(body.session);
        return { data: { session: body.session }, error: null };
      } catch (err: any) {
        return { data: { session: null }, error: new Error(err.message || 'Sign up failed') };
      }
    },
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const body = await res.json();
        if (!res.ok) {
          return { data: { session: null }, error: new Error(body.message || 'Sign in failed') };
        }
        writeStoredSession(body.session);
        return { data: { session: body.session }, error: null };
      } catch (err: any) {
        return { data: { session: null }, error: new Error(err.message || 'Sign in failed') };
      }
    },
    async signOut() {
      writeStoredSession(null);
      return { error: null };
    },
  },
  storage: {
    from(_bucket: string) {
      return {
        async upload(path: string, file: File) {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error('Failed to read image file'));
            reader.readAsDataURL(file);
          });
          uploadedImages.set(path, dataUrl);
          return { data: { path }, error: null };
        },
        getPublicUrl(path: string) {
          return {
            data: {
              publicUrl: uploadedImages.get(path) || HERO_FALLBACK_IMAGE,
            },
          };
        },
      };
    },
  },
};

const uploadedImages = new Map<string, string>();

export const HERO_FALLBACK_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="700" viewBox="0 0 900 700">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#103d9d"/>
      <stop offset="55%" stop-color="#1763dc"/>
      <stop offset="100%" stop-color="#2582f7"/>
    </linearGradient>
    <linearGradient id="plate" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#eef4ff"/>
    </linearGradient>
  </defs>
  <rect width="900" height="700" fill="url(#bg)"/>
  <circle cx="760" cy="140" r="240" fill="#ffffff" opacity="0.08"/>
  <circle cx="140" cy="580" r="280" fill="#ffffff" opacity="0.06"/>
  <circle cx="450" cy="340" r="215" fill="url(#plate)" opacity="0.97"/>
  <circle cx="450" cy="340" r="182" fill="none" stroke="#dbe7ff" stroke-width="4" stroke-dasharray="10 8"/>
  <text x="450" y="325" font-size="115" text-anchor="middle">🍛</text>
  <text x="335" y="425" font-size="68" text-anchor="middle">🥞</text>
  <text x="565" y="425" font-size="68" text-anchor="middle">🧋</text>
  <rect x="275" y="590" width="350" height="48" rx="24" fill="#ffffff" opacity="0.16"/>
  <text x="450" y="621" font-family="sans-serif" font-size="18" font-weight="bold" fill="#ffffff" letter-spacing="2" text-anchor="middle">FRESH CAMPUS KITCHEN</text>
</svg>`)}`;

export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };
  const res = await fetch(`/api${path}`, { ...options, headers });
  const text = await res.text();
  let body: any = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { message: text };
  }
  if (!res.ok) {
    throw new Error(body.message || body.error || `Request failed (${res.status})`);
  }
  return body as T;
}

export const money = (n: number | string | null | undefined): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(n || 0));

export const statusClass = (s: string | null | undefined): string =>
  String(s || 'pending')
    .toLowerCase()
    .replaceAll(' ', '-');
