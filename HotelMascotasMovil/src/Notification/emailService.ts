import { IEmailService } from './types';

// ========================
// EMAIL SERVICE
// ========================

class EmailService implements IEmailService {
  private emailApiUrl: string;

  constructor() {
    // Esta URL debe apuntar a tu API backend o Supabase Edge Function
    this.emailApiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  }

  async sendNotification(
    email: string,
    name: string,
    description: string
  ): Promise<void> {
    try {
      const response = await fetch(`${this.emailApiUrl}/email-sender`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          description,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Error enviando email: ${error}`);
      }

      console.log(`[EmailService] Email enviado exitosamente a ${email}`);
    } catch (error) {
      console.error('[EmailService] Error al enviar email:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
