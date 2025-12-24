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
      const loaded = TabStorage.load() as TabItem[];
      if (loaded?.length) {
        const normalized = loaded.map(t => ({
          ...t,
          id: t.id ?? this.createId(),
        }));
        this.tabsSignal.set(normalized);

        // if nothing active yet, activate last
        if (!this.activeTabIdSignal()) {
          this.activeTabIdSignal.set(normalized[normalized.length - 1].id);
        }
      }
    } catch {}
  }

  openOrActivate(path: string, title?: string, pinned = false) {
    const existing = this.tabsSignal().find(t => t.path === path);
    if (existing) {
      if (pinned && !existing.pinned) {
        this.tabsSignal.update(tabs => tabs.map(t => (t.id === existing.id ? { ...t, pinned: true } : t)));
      }
      this.activateTab(existing.id);
      TabStorage.save(this.tabsSignal());
      return existing;
    }
    return this.openNewTab(path, title, pinned);
  }

  // ALWAYS creates a new tab instance.
  // If `path` doesn't have tabId, it will add it using the generated tab id.
  openNewTab(path: string, title?: string, pinned = false) {
    const id = this.createId();
    const finalPath = this.ensureTabIdInPath(path, id);

    const tab: TabItem = { id, path: finalPath, title, pinned };
    this.tabsSignal.update(tabs => [...tabs, tab]);
    this.activateTab(id);
    TabStorage.save(this.tabsSignal());
    return tab;
  }

  activateTab(id: string | null) {
    this.activeTabIdSignal.set(id);
  }

  // Returns the next active tab (or null) so caller can navigate.
  closeTab(id: string): TabItem | null {
    const before = this.tabsSignal();
    const closing = before.find(t => t.id === id);
    if (!closing) return this.getActiveTab();

    if (closing.pinned) return this.getActiveTab();

    const idx = before.findIndex(t => t.id === id);
    const nextTabs = before.filter(t => t.id !== id);

    this.tabsSignal.set(nextTabs);

    try { this.reuse.deleteTab(id); } catch {}

    if (this.activeTabIdSignal() === id) {
      const candidate =
        nextTabs[Math.min(idx, nextTabs.length - 1)] ??
        nextTabs[nextTabs.length - 1] ??
        null;

      this.activeTabIdSignal.set(candidate?.id ?? null);
    }

    TabStorage.save(this.tabsSignal());
    return this.getActiveTab();
  }

  closeOthers(keepId: string) {
    const before = this.tabsSignal();
    const keep = before.find(t => t.id === keepId);
    const keepSet = new Set([keepId, ...before.filter(t => t.pinned).map(t => t.id)]);

    const removed = before.filter(t => !keepSet.has(t.id));
    this.tabsSignal.set(before.filter(t => keepSet.has(t.id)));

    for (const t of removed) {
      try { this.reuse.deleteTab(t.id); } catch {}
    }

    if (!this.activeTabIdSignal() || !keepSet.has(this.activeTabIdSignal()!)) {
      this.activeTabIdSignal.set(keep?.id ?? (this.tabsSignal().at(-1)?.id ?? null));
    }

    TabStorage.save(this.tabsSignal());
  }

  pinTab(id: string) {
    this.tabsSignal.update(tabs => tabs.map(t => (t.id === id ? { ...t, pinned: true } : t)));
    TabStorage.save(this.tabsSignal());
  }

  closeAll() {
    const before = this.tabsSignal();
    this.tabsSignal.set([]);
    this.activeTabIdSignal.set(null);

    // clear cached views
    try { this.reuse.clear(); } catch {}
    TabStorage.clear();
  }

  getActiveTab(): TabItem | null {
    const id = this.activeTabIdSignal();
    if (!id) return null;
    return this.tabsSignal().find(t => t.id === id) ?? null;
  }

  private createId() {
    return (crypto as any)?.randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2);
  }

  private ensureTabIdInPath(path: string, tabId: string) {
    // If tabId already exists, do not override
    if (/([?&])tabId=/.test(path)) return path;

    const joiner = path.includes('?') ? '&' : '?';
    return `${path}${joiner}tabId=${encodeURIComponent(tabId)}`;
  }
}
