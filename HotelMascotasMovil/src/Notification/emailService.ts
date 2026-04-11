import { supabase } from '@/lib/supabase';
import { IEmailService } from './types';

// ========================
// EMAIL SERVICE
// ========================

class EmailService implements IEmailService {
  private emailApiUrl: string;

  constructor() {
    // Esta URL can be used as fallback but we prefer Supabase Functions invoke below
    this.emailApiUrl = process.env.EXPO_PUBLIC_API_URL || '';
  }

  async sendNotification(
    email: string,
    name: string,
    description: string
  ): Promise<void> {
    const functionName = process.env.EXPO_PUBLIC_FUNCTION_NAME || 'email-sender';

    // First, try Supabase Functions invoke (preferred)
    try {
      console.log(`[EmailService] Invocando Edge Function ${functionName} para ${email}`);

      const { data, error } = await supabase.functions.invoke(functionName, {
        method: 'POST',
        body: JSON.stringify({ email, name, description }),
      });

      if (error) {
        console.error('[EmailService] Error desde supabase.functions.invoke:', error);
        throw error;
      }

      console.log(`[EmailService] Email enviado exitosamente a ${email}`, data);
      return;
    } catch (invokeError: any) {
      const msg = invokeError?.message || String(invokeError);
      console.warn('[EmailService] supabase.functions.invoke falló, intentando fallback HTTP:', msg);

      // If the function was not found (404), treat as non-blocking: log and return.
      // This prevents notification flows from throwing when the Edge Function isn't deployed.
      if (msg && msg.toLowerCase().includes('not found')) {
        console.warn('[EmailService] Edge Function no encontrada (404). Omisión del envío de email.');
        return;
      }

      // If we have an explicit API URL configured, try posting there first.
      if (this.emailApiUrl) {
        try {
          const url = this.emailApiUrl.replace(/\/$/, '') + `/${functionName}`;
          console.log(`[EmailService] Intentando POST a ${url}`);
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, description }),
          });
          if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`);
          }
          console.log(`[EmailService] Email enviado via API_URL a ${email}`);
          return;
        } catch (apiErr) {
          console.warn('[EmailService] Fallback EXPO_PUBLIC_API_URL falló:', apiErr);
        }
      }

      // As a last resort, attempt to call the Supabase Functions HTTP endpoint directly.
      try {
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
        const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
        if (!supabaseUrl) throw new Error('EXPO_PUBLIC_SUPABASE_URL no está configurada');

        const url = supabaseUrl.replace(/\/$/, '') + `/functions/v1/${functionName}`;
        console.log(`[EmailService] Intentando POST directo a ${url}`);
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(supabaseAnonKey ? { Authorization: `Bearer ${supabaseAnonKey}` } : {}),
            // Supabase edge functions may require the anon key depending on configuration
          },
          body: JSON.stringify({ email, name, description }),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`);
        }
        console.log(`[EmailService] Email enviado via supabase HTTP a ${email}`);
        return;
      } catch (directErr) {
        console.error('[EmailService] Todos los intentos fallaron al enviar email:', directErr);
        // Re-throw the original invoke error to preserve stack/context for callers
        throw invokeError || directErr;
      }
    }
  }
}

export const emailService = new EmailService();
