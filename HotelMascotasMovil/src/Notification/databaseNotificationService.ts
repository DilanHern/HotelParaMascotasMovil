import { supabase } from '@/lib/supabase';
import { INotification, INotificationService } from './types';

// ========================
// DATABASE NOTIFICATION SERVICE
// ========================

class DatabaseNotificationService implements INotificationService {
  async saveNotification(notification: INotification): Promise<INotification> {
    try {
      const { data, error } = await supabase
        .from('pl_notifications')
        .insert({
          user_id: notification.user_id,
          notification_type_id: notification.notification_type_id,
          name: notification.name,
          description: notification.description,
          date: notification.date || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('[DatabaseNotificationService] Error al guardar notificación:', error);
        throw error;
      }

      console.log('[DatabaseNotificationService] Notificación guardada:', data);
      return data;
    } catch (error) {
      console.error('[DatabaseNotificationService] Error en saveNotification:', error);
      throw error;
    }
  }

  async getNotificationTypeId(typeName: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('pl_notificationtypes')
        .select('id')
        .eq('name', typeName)
        .single();

      if (error) {
        console.error(
          `[DatabaseNotificationService] Error al obtener tipo de notificación '${typeName}':`,
          error
        );
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('[DatabaseNotificationService] Error en getNotificationTypeId:', error);
      throw error;
    }
  }

  async getUserEmail(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('pl_users')
        .select('email')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[DatabaseNotificationService] Error al obtener email del usuario:', error);
        return null;
      }

      return data?.email || null;
    } catch (error) {
      console.error('[DatabaseNotificationService] Error en getUserEmail:', error);
      return null;
    }
  }

  async getReservationDetails(reservationId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('pl_reservations')
        .select(
          `
          *,
          pet:pl_pets(name, owner_id),
          room:pl_rooms(name),
          status:pl_reservationstatus(name),
          lodging_type:pl_loggingtypes(type)
        `
        )
        .eq('id', reservationId)
        .single();

      if (error) {
        console.error('[DatabaseNotificationService] Error al obtener detalles de reserva:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[DatabaseNotificationService] Error en getReservationDetails:', error);
      return null;
    }
  }

  async getPetDetails(petId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('pl_pets')
        .select('*, pet_type:pl_pettypes(name), owner:pl_users(id, email, firstname)')
        .eq('id', petId)
        .single();

      if (error) {
        console.error('[DatabaseNotificationService] Error al obtener detalles de mascota:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[DatabaseNotificationService] Error en getPetDetails:', error);
      return null;
    }
  }

  async getNotificationsByUserId(userId: string, limit: number = 50): Promise<INotification[]> {
    try {
      const { data, error } = await supabase
        .from('pl_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[DatabaseNotificationService] Error al obtener notificaciones:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[DatabaseNotificationService] Error en getNotificationsByUserId:', error);
      return [];
    }
  }
}

export const databaseNotificationService = new DatabaseNotificationService();
