import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-permissions-page',
  standalone: true,
  templateUrl: './permissions-page.component.html',
  styleUrl: './permissions-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermissionsPageComponent {}
