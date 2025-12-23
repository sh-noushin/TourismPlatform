import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'user-edit',
  imports: [CommonModule],
  template: `
    <div class="edit-shell">
      <h3>User Edit</h3>
      <p>Editing user ID: {{ id }}</p>
    </div>
  `
})
export class UserEditComponent {
  id: string | null = null;
  constructor(route: ActivatedRoute) { this.id = route.snapshot.paramMap.get('id'); }
}
