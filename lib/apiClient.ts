export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006/v1';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('rft_admin_token') || getCookie('rft_token');
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// In-Memory Client Cache for instant UI responses
interface CacheItem {
  timestamp: number;
  data: any;
}
const apiCache = new Map<string, CacheItem>();
const CACHE_TTL_MS = 15_000; // 15 seconds fast cache

export function clearAdminApiCache() {
  apiCache.clear();
}

export async function adminApiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const token = getAdminToken();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const cacheKey = `${url}:${token || 'anon'}`;

  // Invalidate cache on mutations
  if (method !== 'GET') {
    apiCache.clear();
  } else {
    // Serve from instant memory cache if fresh
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      window.localStorage.removeItem('rft_user');
      window.localStorage.removeItem('rft_admin_token');
      document.cookie = 'rft_token=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'rft_user=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'rft_role=; path=/; max-age=0; SameSite=Lax';
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    const errorMsg = data?.message || data?.error || `HTTP ${response.status}`;
    throw new Error(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
  }

  if (method === 'GET') {
    apiCache.set(cacheKey, { timestamp: Date.now(), data });
  }

  return data;
}
