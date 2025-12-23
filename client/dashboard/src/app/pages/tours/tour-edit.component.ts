import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'tour-edit',
  imports: [CommonModule],
  template: `
    <div class="edit-shell">
      <h3>Tour Edit</h3>
      <p>Editing tour ID: {{ id }}</p>
    </div>
  `
})
export class TourEditComponent {
  id: string | null = null;
  constructor(route: ActivatedRoute) { this.id = route.snapshot.paramMap.get('id'); }
}
