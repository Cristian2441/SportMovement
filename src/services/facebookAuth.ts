import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { authApi } from './api';

// En entornos web esto asegura que la ventana del popup se cierre y se capture la respuesta
WebBrowser.maybeCompleteAuthSession();

export const signInWithFacebook = async () => {
  try {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('No se encontró EXPO_PUBLIC_SUPABASE_URL en el entorno');
    }

    const redirectUrl = AuthSession.makeRedirectUri({
      scheme: 'sportmovement',
    });

    const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=facebook&redirect_to=${encodeURIComponent(redirectUrl)}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

    if (result.type === 'success' && result.url) {
      // Supabase devuelve el token en el fragmento del URL (#access_token=...)
      const urlStr = result.url.replace('#', '?');
      const match = urlStr.match(/access_token=([^&]+)/);
      const accessToken = match ? match[1] : null;

      if (!accessToken) {
        throw new Error('No se recibió access_token de Facebook/Supabase');
      }

      const authResponse = await authApi.loginWithFacebook(accessToken);
      return authResponse;
    } else {
      throw { code: 'SIGN_IN_CANCELLED', message: 'Sign in action cancelled' };
    }
  } catch (error: any) {
    console.error('Error in Facebook Sign-In:', error);
    throw error;
  }
};
