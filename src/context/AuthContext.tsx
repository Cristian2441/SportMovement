import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '@/services/api';

const TOKEN_KEY = 'sportmovement_token';
const USER_KEY = 'sportmovement_user';

type User = {
  id: string;
  email: string;
  nombre_completo?: string;
  // Otros datos del usuario que vengan del back...
};

type AuthContextType = {
  token: string | null;
  user: User | null;
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
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Cargar sesión guardada al iniciar la app
    const loadSession = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        const storedUser = await SecureStore.getItemAsync(USER_KEY);
        
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

  // Proteger las rutas de la app (Redirección automática)
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      // No hay sesión y trata de entrar a la app → enviarlo a login
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      // Tiene sesión y trata de entrar al login/registro → mandarlo a la app
      router.replace('/(tabs)');
    }
  }, [token, segments, isLoading]);

  const login = async (newToken: string, newUser: any) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, newToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    } catch (error) {
      console.error('Error guardando la sesión', error);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        // Opcional: avisar al backend que se cerró sesión
        await authApi.logout(token).catch(console.error);
      }
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      setToken(null);
      setUser(null);
      
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
