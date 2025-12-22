import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-tours-list',
  standalone: true,
  templateUrl: './tours-list.component.html',
  styleUrl: './tours-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToursListComponent {}
