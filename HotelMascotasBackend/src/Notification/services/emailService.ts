import nodemailer from 'nodemailer';
import { IEmailService } from './types/notification';

// ========================
// EMAIL SERVICE
// ========================

class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    // Configurar según tu proveedor de email
    // Opciones:
    // 1. SMTP genérico (Gmail, Outlook, etc.)
    // 2. SendGrid
    // 3. Otros servicios

    // Usar variables de entorno
    const emailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // true para 465, false para otros puertos
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);
    console.log('Email Service inicializado');
  }

  async sendNotification(
    email: string,
    name: string,
    description: string
  ): Promise<void> {
    if (!this.transporter) {
      throw new Error('Email Service no está inicializado');
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@hotelmascotasxyz.com',
        to: email,
        subject: `Notificación: ${name}`,
        html: this.generateEmailTemplate(name, description),
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email enviado a ${email} - ${name}`);
    } catch (error) {
      console.error('Error al enviar email:', error);
      throw error;
    }
  }

  private generateEmailTemplate(name: string, description: string): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Arial', sans-serif; background-color: #f5f5f5; line-height: 1.6; }
    .container { max-width: 600px; margin: 20px auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; }
    .header h1 { color: white; font-size: 28px; margin-bottom: 5px; }
    .header p { color: rgba(255,255,255,0.9); font-size: 14px; }
    .content { padding: 30px 20px; }
    .notification-box { background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin-bottom: 20px; border-radius: 4px; }
    .notification-title { font-weight: bold; color: #333; font-size: 16px; margin-bottom: 8px; }
    .notification-description { color: #666; font-size: 14px; line-height: 1.6; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e1e1e1; }
    .footer p { color: #999; font-size: 12px; }
    .button { display: inline-block; background-color: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
    .button:hover { background-color: #764ba2; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🐾 Hotel para Mascotas</h1>
      <p>Notificación Importante</p>
    </div>

    <div class="content">
      <div class="notification-box">
        <div class="notification-title">${this.escapeHtml(name)}</div>
        <div class="notification-description">${this.escapeHtml(description)}</div>
      </div>

      <p style="color: #666; font-size: 14px;">
        Si tienes preguntas o necesitas más información, no dudes en contactarnos.
      </p>
    </div>

    <div class="footer">
      <p>&copy; 2026 Hotel para Mascotas. Todos los derechos reservados.</p>
      <p>Este email fue enviado porque eres usuario registrado en nuestro servicio.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}

export const emailService = new EmailService();
