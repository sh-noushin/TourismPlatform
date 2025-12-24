import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TabService, TabItem } from '../../../core/tab/tab.service';

@Component({
  standalone: true,
  selector: 'sf-tabs',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (tabs.tabs().length) {
      <nav class="sf-tabs">
        @for (tab of tabs.tabs(); track tab.id) {
          <div class="sf-tab" [class.active]="tab.id === tabs.activeTabId()" [class.pinned]="!!tab.pinned">
            <button type="button" class="sf-tab__select" (click)="select(tab)">
              <span class="title">{{ tab.title ?? tab.path }}</span>
            </button>

            <button
              type="button"
              class="sf-tab__pin"
              (click)="togglePin(tab)"
              [attr.aria-label]="tab.pinned ? 'Unpin tab' : 'Pin tab'"
            >
              {{ tab.pinned ? '📌' : '📍' }}
            </button>

            @if (!tab.pinned) {
              <button
                type="button"
                class="sf-tab__close"
                (click)="close(tab)"
                aria-label="Close tab"
              >
                ✕
              </button>
            }
          </div>
        }
      </nav>
    }
  `,
  styles: [`
    .sf-tabs {
      display: flex;
      gap: 8px;
      padding: 8px;
      background: #fff;
      border: 1px solid rgba(0,0,0,0.06);
      border-radius: 14px;
      overflow: auto;
    }

    .sf-tab {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: 12px;
      background: #f5f5f5;
      border: 1px solid rgba(0,0,0,0.05);
    }

    .sf-tab.active {
      background: rgba(109, 76, 255, 0.14);
      border-color: rgba(109, 76, 255, 0.22);
    }

    .sf-tab.pinned {
      background: rgba(47, 128, 237, 0.10);
      border-color: rgba(47, 128, 237, 0.18);
    }

    .sf-tab__select {
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 6px 8px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      max-width: 320px;
    }

    .title {
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 260px;
    }

    .sf-tab__pin,
    .sf-tab__close {
      width: 30px;
      height: 30px;
      border-radius: 10px;
      border: none;
      background: rgba(0,0,0,0.06);
      cursor: pointer;
    }

    .sf-tab__pin:hover,
    .sf-tab__close:hover {
      background: rgba(0,0,0,0.10);
    }
  `],
})
export class SfTabsComponent {
  constructor(public readonly tabs: TabService, private readonly router: Router) {}

  select(tab: TabItem) {
    this.tabs.activateTab(tab.id);
    try { this.router.navigateByUrl(tab.path); } catch {}
  }

  close(tab: TabItem) {
    this.tabs.closeTab(tab.id);

    // If closed active, navigate to new active tab
    const nextId = this.tabs.activeTabId();
    const next = nextId ? this.tabs.tabs().find((t: TabItem) => t.id === nextId) : null;
    if (next) {
      try { this.router.navigateByUrl(next.path); } catch {}
    }
  }

  togglePin(tab: TabItem) {
    if (tab.pinned) this.tabs.unpinTab(tab.id);
    else this.tabs.pinTab(tab.id);
  }
}
