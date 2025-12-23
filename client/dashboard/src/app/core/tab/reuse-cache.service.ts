import { Injectable } from '@angular/core';
import { DetachedRouteHandle } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class ReuseCacheService {
  // cache: tabId -> (routeKey -> handle)
  private cache = new Map<string, Map<string, DetachedRouteHandle | null>>();

  set(tabId: string, routeKey: string, handle: DetachedRouteHandle | null) {
    if (!tabId || !routeKey) return;
    let m = this.cache.get(tabId);
    if (!m) {
      m = new Map<string, DetachedRouteHandle | null>();
      this.cache.set(tabId, m);
    }
    m.set(routeKey, handle);
  }

  get(tabId: string, routeKey: string): DetachedRouteHandle | null | undefined {
    return this.cache.get(tabId)?.get(routeKey);
  }

  has(tabId: string, routeKey: string): boolean {
    return !!this.cache.get(tabId)?.has(routeKey);
  }

  deleteTab(tabId: string) {
    this.cache.delete(tabId);
  }

  clear() {
    this.cache.clear();
  }
}
