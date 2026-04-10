/**
 * BACKEND DE EMAILS - Express.js
 *
 * Este es un ejemplo de cómo implementar el backend que recibe las solicitudes
 * de envío de emails desde el cliente Expo.
 *
 * Instalación:
 * npm install express dotenv nodemailer cors
 *
 * Archivo: backend/emailServer.ts (o .js)
 */

import express, { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// ========================
// MIDDLEWARE
// ========================

app.use(cors());
app.use(express.json());

// ========================
// CONFIGURACIÓN DE EMAIL
// ========================

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

const emailConfig: EmailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
};

const transporter = nodemailer.createTransport(emailConfig);

// ========================
// ENDPOINTS
// ========================

/**
 * POST /send-notification-email
 * Envía una notificación por email
 */
app.post('/send-notification-email', async (req: Request, res: Response) => {
  try {
    const { email, name, description } = req.body;

    // Validar datos
    if (!email || !name || !description) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: email, name, description',
      });
    }

    // Generar HTML del email
    const htmlContent = generateEmailTemplate(name, description);

    // Enviar email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@hotelmascotasxyz.com',
      to: email,
      subject: `Notificación: ${name}`,
      html: htmlContent,
    });

    console.log(`[Email] Email enviado a ${email} - ${name}`);

    res.json({
      success: true,
      message: 'Email enviado exitosamente',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('[Email] Error al enviar:', error);
    res.status(500).json({
      error: 'Error al enviar email',
      details: (error as Error).message,
    });
  }
});

/**
 * GET /health
 * Health check del servidor
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========================
// GENERADOR DE TEMPLATE
// ========================

function generateEmailTemplate(name: string, description: string): string {
  const escapedName = escapeHtml(name);
  const escapedDescription = escapeHtml(description);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f5f5f5;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      color: white;
      font-size: 28px;
      margin-bottom: 5px;
    }
    .header p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
    }
    .content {
      padding: 30px 20px;
    }
    .notification-box {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    .notification-title {
      font-weight: bold;
      color: #333;
      font-size: 16px;
      margin-bottom: 8px;
    }
    .notification-description {
      color: #666;
      font-size: 14px;
      line-height: 1.6;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      border-top: 1px solid #e1e1e1;
    }
    .footer p {
      color: #999;
      font-size: 12px;
      margin-bottom: 5px;
    }
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
        <div class="notification-title">${escapedName}</div>
        <div class="notification-description">${escapedDescription}</div>
      </div>

      <p style="color: #666; font-size: 14px; margin-top: 20px;">
        Si tienes preguntas o necesitas más información, no dudes en contactarnos respondiendo a este email.
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

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// ========================
// MANEJO DE ERRORES
// ========================

app.use((err: any, req: Request, res: Response) => {
  console.error('[Error]', err);
  res.status(500).json({
    error: 'Error interno del servidor',
  });
});

// ========================
// 404
// ========================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.path,
  });
});

// ========================
// INICIAR SERVIDOR
// ========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor de emails escuchando en puerto ${PORT}`);
  console.log(`📧 Email configurado: ${emailConfig.auth.user}`);
});

export default app;

/**
 * .env requerido:
 * PORT=3000
 * EMAIL_HOST=smtp.gmail.com
 * EMAIL_PORT=587
 * EMAIL_SECURE=false
 * EMAIL_USER=tu-email@gmail.com
 * EMAIL_PASSWORD=tu-app-password
 * EMAIL_FROM=noreply@hotelmascotasxyz.com
 *
 * Para Gmail:
 * 1. Habilitar "Less secure apps" o generar "App Password"
 * 2. Usar la contraseña específica de la app
 */
