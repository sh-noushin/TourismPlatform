import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-houses-list',
  standalone: true,
  templateUrl: './houses-list.component.html',
  styleUrl: './houses-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HousesListComponent {}
