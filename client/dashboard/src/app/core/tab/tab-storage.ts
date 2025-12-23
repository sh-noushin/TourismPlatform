const STORAGE_KEY = 'dashboard_tabs_v1';

export const TabStorage = {
  save(tabs: any[]) {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tabs)); } catch {}
  },
  load(): any[] {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]') as any[]; } catch { return []; }
  },
  clear() {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  }
};
