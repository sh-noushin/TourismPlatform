import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, computed, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, firstValueFrom } from 'rxjs';

import { SfCardComponent } from '../../shared/ui/sf-card/sf-card.component';
import { SfButtonComponent } from '../../shared/ui/sf-button/sf-button.component';
import { SfPageHeaderComponent } from '../../shared/ui/sf-page-header/sf-page-header.component';
import { SfTableComponent } from '../../shared/ui/sf-table/sf-table.component';
import { SfTableColumn } from '../../shared/models/table.models';

import { ApiException, Client, ProblemDetails, PublicContactInfoDto } from '../../api/client';
import { PublicContactInfoEditComponent } from './public-contact-info-edit.component';

@Component({
  standalone: true,
  selector: 'public-contact-info-page',
  templateUrl: './public-contact-info-page.component.html',
  styleUrls: ['./public-contact-info-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule, TranslateModule, SfCardComponent, SfPageHeaderComponent, SfTableComponent, SfButtonComponent]
})
export class PublicContactInfoPageComponent implements OnDestroy {
  readonly lang = signal<'fa' | 'en'>('fa');
  private readonly langSub: Subscription;

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly item = signal<PublicContactInfoDto | null>(null);

  readonly rows = computed(() => (this.item() ? [this.item()!] : []));

  readonly columns = computed<SfTableColumn[]>(() => {
    this.lang();
    return [
      { key: 'locale', header: 'Locale', field: 'locale', sortable: false, align: 'start' },
      { key: 'title', header: 'Title', field: 'title' },
      { key: 'email', header: 'Email', field: 'email' },
      { key: 'phone', header: 'Phone', field: 'phone' },
      { key: 'isActive', header: 'Active', field: 'isActive' }
    ];
  });

  readonly actions = computed(() => {
    this.lang();
    return [{ label: this.translate.instant('COMMON.EDIT'), type: 'edit', icon: 'edit' }];
  });

  constructor(
    private readonly client: Client,
    private readonly dialog: MatDialog,
    private readonly translate: TranslateService
  ) {
    const currentLang = (this.translate.currentLang as 'fa' | 'en') || (this.translate.getDefaultLang() as 'fa' | 'en') || 'fa';
    this.lang.set(currentLang === 'en' ? 'en' : 'fa');
    this.langSub = this.translate.onLangChange.subscribe(({ lang }) => this.lang.set(lang === 'en' ? 'en' : 'fa'));
    void this.load();
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  async load(force = false): Promise<void> {
    void force;
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await firstValueFrom(this.client.contactInfoGET(this.lang()));
      this.item.set(data ?? null);
    } catch (err: any) {
      const status = (err as ProblemDetails)?.status ?? (ApiException.isApiException(err) ? err.status : undefined);
      if (status === 404) {
        this.item.set(null);
      } else {
        this.error.set(err?.message ?? 'Failed loading contact info');
      }
    } finally {
      this.loading.set(false);
    }
  }

  openCreateOrEdit(): void {
    const ref = this.dialog.open(PublicContactInfoEditComponent, {
      panelClass: 'public-page-edit-dialog',
      autoFocus: false,
      maxWidth: 'none',
      width: 'min(720px, calc(100vw - 32px))',
      data: { locale: this.lang(), existing: this.item() }
    });

    ref.afterClosed().subscribe((saved) => {
      if (saved) void this.load(true);
    });
  }

  onRowAction(event: { action: any; row: PublicContactInfoDto }) {
    if (event?.action?.type === 'edit') {
      this.openCreateOrEdit();
    }
  }
}
