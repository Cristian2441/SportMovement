/**
 * Sport Movement — Servicio de API centralizado
 * Todas las llamadas al backend pasan por aquí.
 */

import * as SecureStore from 'expo-secure-store';

// La URL ahora viene del archivo .env (EXPO_PUBLIC_API_URL)
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const token = await SecureStore.getItemAsync('sportmovement_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error fetching token for request', error);
  }

  const res = await fetch(url, {
    headers: { ...headers, ...(options?.headers ?? {}) },
    ...options,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error ?? 'Error desconocido');
  }
  return json as T;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
  };
  message?: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    nombre_completo: string;
    rut?: string;
    email: string;
    password: string;
  }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: (token: string) =>
    request<{ message: string }>('/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }),

  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyResetCode: (email: string, code: string) =>
    request<{ message: string }>('/auth/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),

  resetPasswordConfirm: (email: string, code: string, newPassword: string) =>
    request<{ message: string }>('/auth/reset-password-confirm', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword }),
    }),

  refresh: (refreshToken: string) =>
    request<{ token: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
};

// ─── Personas ─────────────────────────────────────────────────────────────────

export interface QrData {
  persona_id: string;
  nombre_completo: string;
}

export const personaApi = {
  getMiQr: () => request<QrData>('/personas/mi-qr'),
};
