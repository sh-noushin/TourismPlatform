import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TabService } from '../../../core/tab/tab.service';

@Component({
  standalone: true,
  selector: 'sf-tabs',
  template: `
    <nav class="sf-tabs" *ngIf="tabs.tabs().length">
      <button
        *ngFor="let tab of tabs.tabs(); trackBy: trackById"
        type="button"
        class="sf-tab"
        [class.pinned]="tab.pinned"
        [class.active]="tab.id === tabs.activeTabId()"
        (click)="select(tab)">
        <span class="title">{{ tab.title ?? tab.path }}</span>
        <button type="button" class="pin" (click)="pin(tab); $event.stopPropagation()">{{ tab.pinned ? '📌' : '📍' }}</button>
        <button type="button" class="close" (click)="close(tab); $event.stopPropagation()">✕</button>
      </button>
    </nav>
  `,
  styles: [
    `
    .sf-tabs { display:flex; gap:8px; padding:8px; background:#fff; border-bottom:1px solid rgba(0,0,0,0.06);} 
    .sf-tab { display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:6px; background:#f5f5f5; border:1px solid rgba(0,0,0,0.04);} 
    .sf-tab.active { background:#e0f7ff; border-color:#00aaff; }
    .sf-tab.pinned { background:#e9f5ff; }
    .sf-tab .close, .sf-tab .pin { background:transparent; border:none; cursor:pointer; }
    `
  ],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SfTabsComponent {
  constructor(public readonly tabs: TabService, private readonly router: Router) {}

  select(tab: { path: string }) {
    try { this.router.navigateByUrl(tab.path); } catch {}
  }

  close(tab: { id: string }) {
    this.tabs.closeTab(tab.id);
  }

  pin(tab: { id: string }) {
    this.tabs.pinTab(tab.id);
  }

  trackById(index: number, tab: { id: string }) {
    return tab.id;
  }
}
