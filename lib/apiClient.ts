export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006/v1';

export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  const apiHost = API_BASE_URL.replace(/\/v1\/?$/, '');

  if (trimmed.startsWith('http://localhost:8080')) {
    return trimmed.replace('http://localhost:8080', apiHost);
  }
  if (trimmed.startsWith('http://localhost:3000')) {
    return trimmed.replace('http://localhost:3000', apiHost);
  }
  if (trimmed.startsWith('/uploads/')) {
    return `${apiHost}${trimmed}`;
  }
  return trimmed;
}

export const FALLBACK_ANNOUNCEMENT_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="320" viewBox="0 0 600 320" fill="none"><rect width="600" height="320" fill="%230F172A"/><rect x="16" y="16" width="568" height="288" rx="16" fill="%231E293B" stroke="%23334155" stroke-width="2"/><circle cx="300" cy="130" r="40" fill="%2338BDF8" fill-opacity="0.15"/><path d="M285 130L296 141L316 121" stroke="%2338BDF8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><text x="300" y="200" fill="%23F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" text-anchor="middle">Academic Broadcast Notice</text><text x="300" y="228" fill="%2394A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="500" text-anchor="middle">Official Campus Media Attachment</text></svg>`;

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

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    console.warn(`[API Client Network Error] Failed to reach ${url}:`, netErr?.message || netErr);
    throw new Error('Backend server is unreachable. Please ensure your backend is running on port 3006.');
  }

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
