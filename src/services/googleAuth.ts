import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { authApi } from './api';

// En entornos web esto asegura que la ventana del popup se cierre y se capture la respuesta
WebBrowser.maybeCompleteAuthSession();

export const signInWithGoogle = async () => {
  try {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('No se encontró EXPO_PUBLIC_SUPABASE_URL en el entorno');
    }

    const redirectUrl = AuthSession.makeRedirectUri({
      scheme: 'sportmovement', // Asegúrate de que coincida con el scheme en app.json
    });

    const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

    if (result.type === 'success' && result.url) {
      // Supabase devuelve los tokens en el fragmento (#access_token=...)
      // openAuthSessionAsync returns url like exp://192.168.../#access_token=...
      const urlStr = result.url.replace('#', '?');
      
      // We parse manually or using URL polyfill, but easier is just regex or substring
      const match = urlStr.match(/access_token=([^&]+)/);
      const accessToken = match ? match[1] : null;
      
      if (!accessToken) {
        throw new Error('No se recibió access_token de Google/Supabase');
      }

      // Llamar a nuestro backend pasándole el access_token para que sincronice todo
      const authResponse = await authApi.loginWithGoogle(accessToken);
      
      return authResponse;
    } else {
      throw { code: 'SIGN_IN_CANCELLED', message: 'Sign in action cancelled' };
    }
  } catch (error: any) {
    console.error('Error in Google Sign-In:', error);
    throw error;
  }
};
