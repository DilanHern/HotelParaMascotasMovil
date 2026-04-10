import { registerAllListeners, unregisterAllListeners } from './eventListeners';

// ========================
// NOTIFICATION SYSTEM INITIALIZATION
// ========================

/**
 * Inicializa el sistema completo de notificaciones
 * Debe llamarse una sola vez en el startup de la aplicación
 *
 * @example
 * // En main.ts o index.ts
 * import { initializeNotificationSystem } from './Notification/notificationSystemInit';
 *
 * async function startServer() {
 *   await initializeNotificationSystem();
 *   // resto del código del servidor
 * }
 */
export async function initializeNotificationSystem(): Promise<void> {
  try {
    console.log('🔔 Inicializando Sistema de Notificaciones...');

    // Validar variables de entorno críticas
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      throw new Error(
        'Variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY son requeridas'
      );
    }

    if (
      !process.env.EMAIL_HOST ||
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASSWORD
    ) {
      console.warn(
        '⚠️ Variables de entorno de email no configuradas completamente. Las notificaciones vía email no funcionarán.'
      );
    }

    // Registrar todos los listeners
    registerAllListeners();

    console.log('✓ Sistema de Notificaciones inicializado correctamente');
  } catch (error) {
    console.error('✗ Error al inicializar Sistema de Notificaciones:', error);
    throw error;
  }
}

/**
 * Destruye el sistema de notificaciones
 * Debe llamarse antes de cerrar la aplicación
 *
 * @example
 * // En shutdown
 * import { destroyNotificationSystem } from './Notification/notificationSystemInit';
 *
 * process.on('SIGTERM', async () => {
 *   await destroyNotificationSystem();
 * });
 */
export async function destroyNotificationSystem(): Promise<void> {
  try {
    console.log('🔔 Destruyendo Sistema de Notificaciones...');
    unregisterAllListeners();
    console.log('✓ Sistema de Notificaciones destruido correctamente');
  } catch (error) {
    console.error('✗ Error al destruir Sistema de Notificaciones:', error);
  }
}

// Permitir que el sistema exporte también las interfaces útiles
export { INotificationEvent } from './types/notification';
export { eventEmitter } from './eventEmitter';
export { notificationService } from './notificationService';
export { emailService } from './services/emailService';
export { databaseNotificationService } from './services/databaseNotificationService';
