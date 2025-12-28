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

  constructor(private readonly reuse: ReuseCacheService) {
    try {
      const loaded = TabStorage.load() as TabItem[] | null;
      if (loaded?.length) {
        const normalized = loaded
          .map((t: TabItem) => ({
            ...t,
            id: t.id ?? this.createId(),
          }))
          // drop legacy "Dashboard" tabs or bare /admin tabs
          .filter((t: TabItem) => !/dashboard/i.test(t.title ?? '') && t.path !== '/admin');

        this.tabsSignal.set(normalized);
        if (!this.activeTabIdSignal() && normalized.length) {
          this.activeTabIdSignal.set(normalized[normalized.length - 1].id);
        }
      }
    } catch {}
  }

  openOrActivate(path: string, title?: string, pinned = false) {
    const existing = this.tabsSignal().find((t: TabItem) => t.path === path);
    if (existing) {
      if (pinned && !existing.pinned) {
        this.tabsSignal.update((tabs: TabItem[]) =>
          tabs.map((t: TabItem) => (t.id === existing.id ? { ...t, pinned: true } : t))
        );
      }
      this.activateTab(existing.id);
      TabStorage.save(this.tabsSignal());
      return existing;
    }

    return this.openNewTab(path, title, pinned);
  }

  openNewTab(path: string, title?: string, pinned = false) {
    const id = this.createId();

    const finalPath = this.ensureTabIdInPath(path, id);

    const tab: TabItem = { id, path: finalPath, title, pinned };
    this.tabsSignal.update((tabs: TabItem[]) => [...tabs, tab]);
    this.activateTab(id);
    TabStorage.save(this.tabsSignal());
    return tab;
  }

  activateTab(id: string | null) {
    this.activeTabIdSignal.set(id);
  }

  getActiveTab(): TabItem | null {
    const id = this.activeTabIdSignal();
    if (!id) return null;
    return this.tabsSignal().find((t: TabItem) => t.id === id) ?? null;
  }

  closeTab(id: string) {
    const before = this.tabsSignal();
    const closing = before.find((t: TabItem) => t.id === id);
    if (!closing) return;

    if (closing.pinned) return;

    const idx = before.findIndex((t: TabItem) => t.id === id);
    const nextTabs = before.filter((t: TabItem) => t.id !== id);

    this.tabsSignal.set(nextTabs);

    try {
      this.reuse.deleteTab(id);
    } catch {}

    if (this.activeTabIdSignal() === id) {
      const next =
        nextTabs[Math.min(idx, nextTabs.length - 1)] ??
        nextTabs[nextTabs.length - 1] ??
        null;

      this.activeTabIdSignal.set(next?.id ?? null);
    }

    TabStorage.save(this.tabsSignal());
  }

  closeOthers(keepId: string) {
    const before = this.tabsSignal();
    const keepSet = new Set<string>([
      keepId,
      ...before.filter((t: TabItem) => !!t.pinned).map((t: TabItem) => t.id),
    ]);

    const removed = before.filter((t: TabItem) => !keepSet.has(t.id));
    const remaining = before.filter((t: TabItem) => keepSet.has(t.id));

    this.tabsSignal.set(remaining);

    for (const t of removed) {
      try {
        this.reuse.deleteTab(t.id);
      } catch {}
    }

    if (!this.activeTabIdSignal() || !keepSet.has(this.activeTabIdSignal()!)) {
      this.activeTabIdSignal.set(remaining.at(-1)?.id ?? null);
    }

    TabStorage.save(this.tabsSignal());
  }

  pinTab(id: string) {
    this.tabsSignal.update((tabs: TabItem[]) =>
      tabs.map((t: TabItem) => (t.id === id ? { ...t, pinned: true } : t))
    );
    TabStorage.save(this.tabsSignal());
  }

  unpinTab(id: string) {
    this.tabsSignal.update((tabs: TabItem[]) =>
      tabs.map((t: TabItem) => (t.id === id ? { ...t, pinned: false } : t))
    );
    TabStorage.save(this.tabsSignal());
  }

  closeAll() {
    this.tabsSignal.set([]);
    this.activeTabIdSignal.set(null);
    try {
      this.reuse.clear();
    } catch {}
    TabStorage.clear();
  }

  updateTitle(id: string, title: string) {
    this.tabsSignal.update((tabs: TabItem[]) =>
      tabs.map((t: TabItem) => (t.id === id ? { ...t, title } : t))
    );
    TabStorage.save(this.tabsSignal());
  }

  private createId() {
    return (crypto as any)?.randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2);
  }

  private ensureTabIdInPath(path: string, tabId: string) {
    if (/([?&])tabId=/.test(path)) return path;
    const joiner = path.includes('?') ? '&' : '?';
    return `${path}${joiner}tabId=${encodeURIComponent(tabId)}`;
  }
}
