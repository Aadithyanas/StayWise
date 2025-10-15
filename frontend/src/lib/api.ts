const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5003/api';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function apiFetch<T>(
  path: string,
  options: { method?: HttpMethod; body?: unknown; tokenOverride?: string } = {}
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = options.tokenOverride ?? getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = res.headers.get('Content-Type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : (undefined as unknown as T);

  if (!res.ok) {
    const errorMessage = isJson && (data as any)?.error ? (data as any).error : res.statusText;
    throw new Error(errorMessage);
  }
  return data as T;
}

export const api = {
  // 🔐 Auth
  signup: (email: string, password: string) =>
    apiFetch<{ token: string; user: { id: string; email: string; role: string } }>(
      '/auth/signup',
      { method: 'POST', body: { email, password } }
    ),
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: { id: string; email: string; role: string } }>(
      '/auth/login',
      { method: 'POST', body: { email, password } }
    ),
  adminSignup: (email: string, password: string) =>
    apiFetch<{ token: string; user: { id: string; email: string; role: string } }>(
      '/auth/admin/signup',
      { method: 'POST', body: { email, password } }
    ),

  // 🏡 Local Properties (your own backend)
  getProperty: (id: string) => apiFetch<{ property: any }>(`/properties/${id}`),
  getLocalProperties: () => apiFetch<{ properties: any[] }>(`/properties`),
  createProperty: (input: { title: string; description: string; location: string; pricePerNight: number; images?: string[] }) =>
    apiFetch<{ property: any }>(`/properties`, { method: 'POST', body: input }),

  // 📅 Booking
  createBooking: (input: { propertyId: string; startDate: string; endDate: string }) =>
    apiFetch<{ booking: any }>(`/bookings`, { method: 'POST', body: input }),
  getMyBookings: () => apiFetch<{ bookings: any[] }>('/bookings/mine'),
  getAllBookings: () => apiFetch<{ bookings: any[] }>('/bookings/all'),

  // 📦 External bookings (Google Hotels)
  createExternalBooking: (input: {
    provider: 'google';
    externalId: string;
    name: string;
    imageUrl?: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
  }) => apiFetch<{ booking: any }>(`/external-bookings`, { method: 'POST', body: input }),
  getMyExternalBookings: () => apiFetch<{ bookings: any[] }>(`/external-bookings/mine`),

  // 🌍 External API: Google Hotels (via Express backend proxy)
  getProperties: async (location: string, checkIn: string, checkOut: string, adults = '2') => {
    const params = new URLSearchParams({
      location,
      checkIn,
      checkOut,
      adults,
    });

    const res = await fetch(`${API_BASE}/hotels?${params.toString()}`);
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch hotels');
    }
    
    return res.json();
  },
};