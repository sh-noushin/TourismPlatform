import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SfCardComponent } from '../../shared/ui/sf-card/sf-card.component';
import { SfPageHeaderComponent } from '../../shared/ui/sf-page-header/sf-page-header.component';

@Component({
  standalone: true,
  selector: 'claims-page',
  template: `
    <section class="claims-page">
      <sf-page-header title="Claims" subtitle="Security claims and identity metadata"></sf-page-header>
      <sf-card>
        <p>This area is not implemented yet.</p>
      </sf-card>
    </section>
  `,
  styleUrls: ['./claims-page.component.scss'],
  imports: [CommonModule, SfCardComponent, SfPageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimsPageComponent {}
