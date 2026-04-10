import { IEventEmitter, IEventListener, INotificationEvent } from './types';

// ========================
// EVENT EMITTER (OBSERVER PATTERN)
// ========================

class EventEmitter implements IEventEmitter {
  private listeners: Map<string, IEventListener[]> = new Map();

  on(eventType: string, listener: IEventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);
    console.log(`[Notification] Listener registrado para evento: ${eventType}`);
  }

  off(eventType: string, listener: IEventListener): void {
    if (!this.listeners.has(eventType)) return;

    const eventListeners = this.listeners.get(eventType)!;
    const index = eventListeners.indexOf(listener);
    if (index > -1) {
      eventListeners.splice(index, 1);
      console.log(`[Notification] Listener removido del evento: ${eventType}`);
    }
  }

  async emit(event: INotificationEvent): Promise<void> {
    const eventListeners = this.listeners.get(event.type) || [];
    console.log(
      `[Notification] Emitiendo evento '${event.type}' a ${eventListeners.length} listeners`
    );

    const promises = eventListeners.map((listener) => listener(event));
    const results = await Promise.allSettled(promises);

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          `[Notification] Error en listener ${index} para evento '${event.type}':`,
          result.reason
        );
      }
    });
  }
}

export const eventEmitter = new EventEmitter();
