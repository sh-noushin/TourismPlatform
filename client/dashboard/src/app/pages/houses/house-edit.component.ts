import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'house-edit',
  imports: [CommonModule],
  template: `
    <div class="edit-shell">
      <h3>House Edit</h3>
      <p>Editing house ID: {{ id }}</p>
    </div>
  `
})
export class HouseEditComponent {
  id: string | null = null;
  constructor(route: ActivatedRoute) { this.id = route.snapshot.paramMap.get('id'); }
}
