import { Injectable, signal } from '@angular/core';
import { TabStorage } from './tab-storage';

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

  constructor() {
    // restore persisted tabs
    try { const loaded = TabStorage.load(); if (loaded?.length) this.tabsSignal.set(loaded); } catch {}
  }

  openTab(path: string, title?: string, pinned = false) {
    const id = (crypto as any)?.randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2);
    const existing = this.tabsSignal().find((t) => t.path === path);
    if (existing) {
      // promote to pinned if requested
      if (pinned && !existing.pinned) {
        existing.pinned = true;
        this.tabsSignal.update((tabs) => [...tabs]);
        TabStorage.save(this.tabsSignal());
      }
      return existing;
    }
    const tab: TabItem = { id, path, title, pinned };
    this.tabsSignal.update((tabs) => [...tabs, tab]);
    TabStorage.save(this.tabsSignal());
    return tab;
  }

  closeTab(id: string) {
    this.tabsSignal.update((tabs) => tabs.filter((t) => t.id !== id));
    TabStorage.save(this.tabsSignal());
  }

  pinTab(id: string) {
    this.tabsSignal.update((tabs) => tabs.map((t) => (t.id === id ? { ...t, pinned: true } : t)));
    TabStorage.save(this.tabsSignal());
  }
}
