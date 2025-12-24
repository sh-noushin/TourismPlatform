import { Injectable, signal } from '@angular/core';
import { TabStorage } from './tab-storage';
import { ReuseCacheService } from './reuse-cache.service';

export interface TabItem {
  id: string;
  path: string;
  title?: string;
  pinned?: boolean;
}

@Injectable({ providedIn: 'root' })
export class TabService {
  private readonly tabsSignal = signal<TabItem[]>([]);
  readonly tabs = this.tabsSignal;

  private readonly activeTabIdSignal = signal<string | null>(null);
  readonly activeTabId = this.activeTabIdSignal;

  constructor(private reuse: ReuseCacheService) {
    try {
      const loaded = TabStorage.load();
      if (loaded?.length) {
        const normalized = loaded.map((t) => ({ ...t, id: t.id ?? ((crypto as any)?.randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2)) }));
        this.tabsSignal.set(normalized);
      }
    } catch {}
  }

  openOrActivate(path: string, title?: string, pinned = false) {
    const existing = this.tabsSignal().find((t) => t.path === path);
    if (existing) {
      if (pinned && !existing.pinned) {
        existing.pinned = true;
        this.tabsSignal.update((tabs) => [...tabs]);
      }
      this.activateTab(existing.id);
      TabStorage.save(this.tabsSignal());
      return existing;
    }
    const id = (crypto as any)?.randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2);
    const tab: TabItem = { id, path, title, pinned };
    this.tabsSignal.update((tabs) => [...tabs, tab]);
    this.activateTab(id);
    TabStorage.save(this.tabsSignal());
    return tab;
  }

  activateTab(id: string | null) {
    this.activeTabIdSignal.set(id);
  }

  closeTab(id: string) {
    this.tabsSignal.update((tabs) => tabs.filter((t) => t.id !== id));
    try { this.reuse.deleteTab(id); } catch {}
    if (this.activeTabIdSignal() === id) {
      const remaining = this.tabsSignal();
      const last = remaining.length ? remaining[remaining.length - 1].id : null;
      this.activeTabIdSignal.set(last);
    }
    TabStorage.save(this.tabsSignal());
  }

  closeOthers(keepId: string) {
    this.tabsSignal.update((tabs) => tabs.filter((t) => t.id === keepId || t.pinned));
    const remainingIds = new Set(this.tabsSignal().map((t) => t.id));
    
    TabStorage.save(this.tabsSignal());
  }

  pinTab(id: string) {
    this.tabsSignal.update((tabs) => tabs.map((t) => (t.id === id ? { ...t, pinned: true } : t)));
    TabStorage.save(this.tabsSignal());
  }

  closeAll() {
    this.tabsSignal.set([]);
    this.activeTabIdSignal.set(null);
    this.reuse.clear();
    TabStorage.clear();
  }
}
