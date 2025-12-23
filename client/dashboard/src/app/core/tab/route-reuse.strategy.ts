import { Injectable } from '@angular/core';
import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';
import { ReuseCacheService } from './reuse-cache.service';
import { TabService } from './tab.service';

@Injectable()
export class TabRouteReuseStrategy implements RouteReuseStrategy {
  constructor(private cache: ReuseCacheService, private tabService: TabService) {}

  private routeKey(route: ActivatedRouteSnapshot) {
    const cfgPath = route.routeConfig?.path;
    if (cfgPath) return cfgPath;
    const url = route.url.map(u => u.path).join('/');
    return url || '';
  }

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return !!route.routeConfig && !!this.routeKey(route);
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    const key = this.routeKey(route);
    const tabId = this.tabService.activeTabId();
    if (!key || !tabId) return;
    this.cache.set(tabId, key, handle);
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const key = this.routeKey(route);
    const tabId = this.tabService.activeTabId();
    return !!route.routeConfig && !!tabId && !!key && this.cache.has(tabId, key);
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const key = this.routeKey(route);
    const tabId = this.tabService.activeTabId();
    if (!route.routeConfig || !tabId || !key) return null;
    return this.cache.get(tabId, key) ?? null;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }
}
