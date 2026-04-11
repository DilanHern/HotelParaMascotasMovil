// ========================
// TIPOS DE NOTIFICACIÓN
// ========================

export interface INotification {
  id?: string;
  user_id: string;
  notification_type_id: number;
  name: string;
  description: string;
  date?: string;
}

export interface INotificationEvent {
  type:
    | 'USER_REGISTERED'
    | 'RESERVATION_CREATED'
    | 'RESERVATION_CONFIRMED'
    | 'RESERVATION_MODIFIED'
    | 'RESERVATION_DELETED'
    | 'LODGING_STARTED'
    | 'LODGING_ENDED'
    | 'PET_STATUS_UPDATE';
  user_id: string;
  data: Record<string, any>;
}

export interface IEmailService {
  sendNotification(
    email: string,
    name: string,
    description: string
  ): Promise<void>;
}

export interface INotificationService {
  saveNotification(notification: INotification): Promise<INotification>;
  getNotificationTypeId(typeName: string): Promise<number>;
}

export interface IEventListener {
  (event: INotificationEvent): Promise<void>;
}

export interface IEventEmitter {
  on(eventType: string, listener: IEventListener): void;
  off(eventType: string, listener: IEventListener): void;
  emit(event: INotificationEvent): Promise<void>;
}
