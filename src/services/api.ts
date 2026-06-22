/**
 * Sport Movement — Servicio de API centralizado
 * Todas las llamadas al backend pasan por aquí.
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// La URL ahora viene del archivo .env (EXPO_PUBLIC_API_URL)
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// ─── Session-expired callback ─────────────────────────────────────────────────
// AuthContext registra aquí su función de limpieza para que, cuando el
// refresh falle, la sesión se borre automáticamente sin mostrar errores técnicos.
let _onSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(fn: () => void): void {
  _onSessionExpired = fn;
}

// Código interno que marca la sesión como expirada (nunca se muestra al usuario)
const SESSION_EXPIRED_CODE = 'SESSION_EXPIRED';

// Convierte errores de red / mensajes internos en texto amigable
function toFriendlyMessage(raw: string): string {
  const r = raw.toLowerCase();
  if (
    r.includes('fetch failed') ||
    r.includes('network request failed') ||
    r.includes('enotfound') ||
    r.includes('econnrefused') ||
    r.includes('timeout')
  ) {
    return 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
  }
  if (
    r.includes(SESSION_EXPIRED_CODE.toLowerCase()) ||
    r.includes('refresh token') ||
    r.includes('token almacenado')
  ) {
    return 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
  }
  if (r.includes('error interno')) {
    return 'El servidor no está disponible en este momento. Inténtalo más tarde.';
  }
  return raw;
}

const TOKEN_KEY         = 'sportmovement_token';
const REFRESH_TOKEN_KEY = 'sportmovement_refresh_token';

async function getStoredToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function getStoredRefreshToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

async function saveTokens(token: string, refreshToken: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }
  } catch {
    // Fallo silencioso — la próxima llamada usará el token viejo y fallará normalmente
  }
}

let isRefreshing = false;
let pendingQueue: Array<{ resolve: (t: string) => void; reject: (e: any) => void }> = [];

async function refreshAccessToken(): Promise<string> {
  const storedRefresh = await getStoredRefreshToken();
  if (!storedRefresh) {
    // No hay refresh token: limpiar sesión y notificar
    _onSessionExpired?.();
    throw new Error(SESSION_EXPIRED_CODE);
  }

  const url = `${BASE_URL}/auth/refresh`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: storedRefresh }),
    });
  } catch (networkErr: any) {
    throw new Error(toFriendlyMessage(networkErr?.message ?? 'fetch failed'));
  }

  const json = await res.json();
  if (!res.ok) {
    // Refresh token expirado en el servidor: limpiar sesión
    _onSessionExpired?.();
    throw new Error(SESSION_EXPIRED_CODE);
  }

  await saveTokens(json.token, json.refreshToken);
  return json.token as string;
}

async function request<T>(
  path: string,
  options?: RequestInit,
  _isRetry = false
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = await getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { ...headers, ...(options?.headers ?? {}) },
      ...options,
    });
  } catch (networkErr: any) {
    // Error de red puro (sin conexión, DNS, etc.) → mensaje amigable
    throw new Error(toFriendlyMessage(networkErr?.message ?? 'fetch failed'));
  }

  // ── Auto-refresh on 401 ──────────────────────────────────────────────────
  // No hacer refresh si la petición es a rutas de autenticación (login, register, etc.)
  const skipRefresh = 
    path.startsWith('/auth/login') || 
    path.startsWith('/auth/register') || 
    path.startsWith('/auth/google') || 
    path.startsWith('/auth/facebook') ||
    path.startsWith('/auth/refresh');

  if (res.status === 401 && !_isRetry && !skipRefresh) {
    // Si ya hay un refresh en curso, esperar en cola
    if (isRefreshing) {
      return new Promise<T>((resolve, reject) => {
        pendingQueue.push({
          resolve: async (newToken) => {
            const retryHeaders = {
              ...headers,
              Authorization: `Bearer ${newToken}`,
              ...(options?.headers ?? {}),
            };
            let retryRes: Response;
            try {
              retryRes = await fetch(url, { ...options, headers: retryHeaders });
            } catch (e: any) {
              reject(new Error(toFriendlyMessage(e?.message ?? 'fetch failed')));
              return;
            }
            const retryJson = await retryRes.json();
            if (!retryRes.ok) reject(new Error(toFriendlyMessage(retryJson.error ?? 'Error desconocido')));
            else resolve(retryJson as T);
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      pendingQueue.forEach(({ resolve }) => resolve(newToken));
      pendingQueue = [];
      isRefreshing = false;
      return request<T>(path, options, true);
    } catch (refreshError: any) {
      pendingQueue.forEach(({ reject }) => reject(refreshError));
      pendingQueue = [];
      isRefreshing = false;
      // Convertir cualquier error de refresh a mensaje amigable
      const friendly = toFriendlyMessage(refreshError?.message ?? '');
      throw new Error(friendly);
    }
  }

  const json = await res.json();
  if (!res.ok) {
    throw new Error(toFriendlyMessage(json.error ?? 'Error desconocido'));
  }
  return json as T;
}


// ─── Auth ────────────────────────────────────────────────────────────────────

export type UserRole = 'alumno' | 'entrenador' | 'admin';

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    persona_id?: string;
    nombre_completo?: string;
    rol?: UserRole;
  };
  message?: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  loginWithGoogle: (idToken: string) =>
    request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    }),

  loginWithFacebook: (accessToken: string) =>
    request<AuthResponse>('/auth/facebook', {
      method: 'POST',
      body: JSON.stringify({ accessToken }),
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
  listarPorRol: (rol: string) => request<any[]>(`/personas/rol/${rol}`),
};

export interface RolData {
  rol: UserRole;
  persona_id: string | null;
  nombre_completo: string | null;
}

// ─── Empleados (Admin) ────────────────────────────────────────────────────────

export interface CrearEmpleadoPayload {
  nombre_completo: string;
  email: string;
  password: string;
  cargo: string;
  estado?: string;
  telefono?: string;
  turno?: string;
  salario?: string;
  fecha_ingreso?: string;
  especialidades?: string;
}

export interface Empleado {
  id: string;
  persona_id: string;
  nombre_completo: string;
  email: string;
  cargo: string;
  estado: string;
  turno: string | null;
  salario: number | null;
  fecha_ingreso: string | null;
  especialidades: string | null;
}

export interface CrearEmpleadoResponse {
  message: string;
  empleado: Empleado;
  nota: string;
}

export interface GetEmpleadosResponse {
  empleados: Array<{
    id: string;
    cargo: string;
    estado: string;
    turno: string | null;
    salario: number | null;
    fecha_ingreso: string | null;
    especialidades: string | null;
    personas: {
      id: string;
      nombre_completo: string;
      email: string;
      fono: string | null;
      avatar: string | null;
    };
  }>;
}

export const empleadoApi = {
  crear: (data: CrearEmpleadoPayload) =>
    request<CrearEmpleadoResponse>('/admin/empleados', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  listar: () =>
    request<GetEmpleadosResponse>('/admin/empleados'),

  actualizar: (id: string, data: Partial<CrearEmpleadoPayload>) =>
    request<{ message: string }>(`/admin/empleados/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  eliminar: (id: string) =>
    request<{ message: string }>(`/admin/empleados/${id}`, {
      method: 'DELETE',
    }),
};
