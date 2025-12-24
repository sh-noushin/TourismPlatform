import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Client, ExchangeRateDto, CreateExchangeOrderRequest } from '../../api/client';

@Injectable({ providedIn: 'root' })
export class ExchangeFacade {
  readonly rates = signal<ExchangeRateDto[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private readonly client: Client) {}

  async loadRates() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(this.client.rates());
      this.rates.set(res ?? []);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed loading exchange rates');
    } finally {
      this.loading.set(false);
    }
  }

  async createOrder(payload: CreateExchangeOrderRequest) {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.client.orders(payload));
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed creating exchange order');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }
}
