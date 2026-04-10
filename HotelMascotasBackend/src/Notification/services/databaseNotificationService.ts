import { createClient } from '@supabase/supabase-js';
import { INotification, INotificationService } from '../types/notification';

// ========================
// DATABASE NOTIFICATION SERVICE
// ========================

class DatabaseNotificationService implements INotificationService {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY no configuradas');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async saveNotification(notification: INotification): Promise<INotification> {
    try {
      const { data, error } = await this.supabase
        .from('Pl_Notifications')
        .insert({
          user_id: notification.userId,
          notification_type_id: notification.notificationTypeId,
          name: notification.name,
          description: notification.description,
          date: notification.date || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error al guardar notificación en BD:', error);
        throw error;
      }

      console.log('Notificación guardada en BD:', data);
      return data;
    } catch (error) {
      console.error('Error en saveNotification:', error);
      throw error;
    }
  }

  async getNotificationTypeId(typeName: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('Pl_NotificationTypes')
        .select('id')
        .eq('name', typeName)
        .single();

      if (error) {
        console.error(`Error al obtener tipo de notificación '${typeName}':`, error);
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error en getNotificationTypeId:', error);
      throw error;
    }
  }

  async getUserEmail(userId: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('Pl_Users')
        .select('email')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error al obtener email del usuario:', error);
        return null;
      }

      return data?.email || null;
    } catch (error) {
      console.error('Error en getUserEmail:', error);
      return null;
    }
  }

  async getReservationDetails(reservationId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('Pl_Reservations')
        .select(
          `
          *,
          pet:Pl_Pets (name, owner_id),
          room:Pl_Rooms (name),
          status:Pl_ReservationStatus (name),
          lodging_type:Pl_LodgingTypes (type)
        `
        )
        .eq('id', reservationId)
        .single();

      if (error) {
        console.error('Error al obtener detalles de reserva:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error en getReservationDetails:', error);
      return null;
    }
  }

  async getPetDetails(petId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('Pl_Pets')
        .select('*, pet_type:Pl_PetTypes (name), owner:Pl_Users (id, email, firstname)')
        .eq('id', petId)
        .single();

      if (error) {
        console.error('Error al obtener detalles de mascota:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error en getPetDetails:', error);
      return null;
    }
  }
}

export const databaseNotificationService = new DatabaseNotificationService();
