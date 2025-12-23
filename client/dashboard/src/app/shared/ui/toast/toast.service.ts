import { computed, Injectable, signal } from '@angular/core';

type ToastLevel = 'info' | 'success' | 'warning' | 'danger';

export interface ToastMessage {
  id: string;
  message: string;
  level: ToastLevel;
  createdAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly messagesSignal = signal<ToastMessage[]>([]);
  readonly messages = computed(() => this.messagesSignal());
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  show(message: string, level: ToastLevel = 'info', duration = 4000) {
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    const toast: ToastMessage = { id, message, level, createdAt: Date.now() };
    this.messagesSignal.update((list) => [...list, toast]);
    this.scheduleDismiss(id, duration);
    return id;
  }

  dismiss(id: string) {
    this.timers.get(id) && clearTimeout(this.timers.get(id)!);
    this.timers.delete(id);
    this.messagesSignal.update((list) => list.filter((toast) => toast.id !== id));
  }

  private scheduleDismiss(id: string, duration: number) {
    const timer = setTimeout(() => this.dismiss(id), duration);
    this.timers.set(id, timer);
  }
}
