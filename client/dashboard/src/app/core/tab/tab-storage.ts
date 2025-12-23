const STORAGE_KEY = 'dashboard_tabs_v1';

export const TabStorage = {
  save(tabs: any[]) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs)); } catch {}
  },
  load(): any[] {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as any[]; } catch { return []; }
  }
};
