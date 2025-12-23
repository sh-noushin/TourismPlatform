import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'permission-edit',
  imports: [CommonModule],
  template: `
    <div class="edit-shell">
      <h3>Permission Edit</h3>
      <p>Editing permission ID: {{ id }}</p>
    </div>
  `
})
export class PermissionEditComponent {
  id: string | null = null;
  constructor(route: ActivatedRoute) { this.id = route.snapshot.paramMap.get('id'); }
}
