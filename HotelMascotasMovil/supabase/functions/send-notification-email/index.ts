import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const EMAIL_FROM = "onboarding@resend.dev"

interface EmailRequest {
  email: string
  name: string
  description: string
}

interface EmailResponse {
  success: boolean
  message: string
  messageId?: string
  error?: string
}

// ✅ HEADERS CORS - Configuración robusta
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json",
}

const generateEmailTemplate = (name: string, description: string): string => {
  const escapedName = name.replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[char] || char)

  const escapedDescription = description.replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[char] || char)

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
      background: linear-gradient(135deg, #8b6f47 0%, #6b4226 100%);
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
      border-left: 4px solid #8b6f47;
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
  `.trim()
}

serve(async (req) => {
  // ✅ Manejo de OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    console.log("[email-sender] 📋 Preflight CORS recibido")
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    // Validar método
    if (req.method !== "POST") {
      console.warn(`[email-sender] ⚠️ Método no permitido: ${req.method}`)
      return new Response(
        JSON.stringify({ error: "Método no permitido. Use POST" }),
        {
          status: 405,
          headers: corsHeaders,
        }
      )
    }

    // Parsear body
    let body: EmailRequest
    try {
      body = await req.json()
    } catch (parseError) {
      console.error("[email-sender] ❌ Error parseando JSON:", parseError)
      return new Response(
        JSON.stringify({
          success: false,
          error: "JSON inválido en el body",
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    // Validar datos
    if (!body.email || !body.name || !body.description) {
      console.warn("[email-sender] ⚠️ Campos faltantes en la solicitud")
      return new Response(
        JSON.stringify({
          success: false,
          error: "Faltan campos requeridos: email, name, description",
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    console.log(`[email-sender] 📧 Enviando email a: ${body.email}`)
    console.log(`[email-sender] 📧 Asunto: ${body.name}`)

    // Verificar que RESEND_API_KEY esté configurada
    if (!RESEND_API_KEY) {
      console.error("[email-sender] ❌ RESEND_API_KEY no está configurada")
      return new Response(
        JSON.stringify({
          success: false,
          error: "Error de configuración del servidor (RESEND_API_KEY no configurada)",
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      )
    }

    // Generar HTML
    const htmlContent = generateEmailTemplate(body.name, body.description)

    // Enviar con Resend
    console.log("[email-sender] 🚀 Enviando solicitud a Resend API...")
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: body.email,
        subject: `🐾 Notificación: ${body.name}`,
        html: htmlContent,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("[email-sender] ❌ Error de Resend:", result)
      return new Response(
        JSON.stringify({
          success: false,
          error: result.message || "Error al enviar email con Resend",
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      )
    }

    console.log(`[email-sender] ✅ Email enviado exitosamente a ${body.email}. ID: ${result.id}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email enviado exitosamente",
        messageId: result.id,
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    )
  } catch (error) {
    console.error("[email-sender] ❌ Error no capturado:", error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    )
  }
})
