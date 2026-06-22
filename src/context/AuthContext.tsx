import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { authApi, setSessionExpiredHandler } from '@/services/api';
import type { UserRole } from '@/services/api';

const TOKEN_KEY         = 'sportmovement_token';
const REFRESH_TOKEN_KEY = 'sportmovement_refresh_token';
const USER_KEY          = 'sportmovement_user';

type User = {
  id: string;
  email: string;
  persona_id?: string;
  nombre_completo?: string;
  rol?: UserRole;
};

type AuthContextType = {
  token: string | null;
  user: User | null;
  rol: UserRole | null;
  isLoading: boolean;
  login: (token: string, user: any) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken]     = useState<string | null>(null);
  const [user, setUser]       = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const segments = useSegments();
  const router   = useRouter();

  // Rol derivado del usuario
  const rol: UserRole | null = user?.rol ?? null;

  // Registrar el handler de sesión expirada para que api.ts pueda
  // limpiar la sesión sin mostrar errores técnicos al usuario.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setToken(null);
      setUser(null);
      // Limpiar almacenamiento en background (sin await para no bloquear)
      if (Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } else {
        SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => {});
        SecureStore.deleteItemAsync(USER_KEY).catch(() => {});
      }
    });
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      try {
        let storedToken = null;
        let storedUser = null;
        
        if (Platform.OS === 'web') {
          storedToken = localStorage.getItem(TOKEN_KEY);
          storedUser = localStorage.getItem(USER_KEY);
        } else {
          storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
          storedUser  = await SecureStore.getItemAsync(USER_KEY);
        }

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error cargando sesión:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  // Redirección automática basada en sesión y rol
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup       = segments[0] === '(auth)';
    const inTabsGroup       = segments[0] === '(tabs)';
    const inEntrenadorGroup = segments[0] === '(entrenador)';
    const inAdminGroup      = segments[0] === '(admin)';

    if (!token) {
      // Sin sesión → login
      if (!inAuthGroup) router.replace('/(auth)/login');
      return;
    }

    // Con sesión → redirigir según rol
    const userRol = user?.rol ?? 'alumno';

    if (userRol === 'entrenador') {
      if (!inEntrenadorGroup) router.replace('/(entrenador)/personas');
    } else if (userRol === 'admin') {
      if (!inAdminGroup) router.replace('/(admin)/equipo');
    } else {
      // alumno → tabs normales
      if (!inTabsGroup) router.replace('/(tabs)');
    }
  }, [token, segments, isLoading, user?.rol]);

  const login = async (newToken: string, newUser: any, newRefreshToken?: string) => {
    try {
      setToken(newToken);
      setUser(newUser);
      
      if (Platform.OS === 'web') {
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        if (newRefreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, newToken);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(newUser));
        if (newRefreshToken) await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);
      }
    } catch (error) {
      console.error('Error guardando la sesión', error);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authApi.logout(token).catch(console.error);
      }
      
      setToken(null);
      setUser(null);
      
      if (Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
      }
      
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, rol, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
