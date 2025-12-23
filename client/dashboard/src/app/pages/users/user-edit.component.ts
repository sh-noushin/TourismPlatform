import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsersFacade } from '../../features/users/users.facade';

@Component({
  standalone: true,
  selector: 'user-edit',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="edit-shell">
      <h3>User Edit</h3>
      <p *ngIf="id">Editing user ID: {{ id }}</p>
      <form *ngIf="model">
        <label>Display Name<br /><input name="displayName" [(ngModel)]="model.displayName" /></label><br />
        <label>Email<br /><input name="email" [(ngModel)]="model.email" /></label><br />
        <div style="margin-top:8px">
          <button type="button" (click)="save()" [disabled]="saving">Save</button>
        </div>
      </form>
      <p *ngIf="!model">Loading...</p>
      <p *ngIf="error" style="color:red">{{ error }}</p>
      <p *ngIf="saved" style="color:green">Saved.</p>
    </div>
  `
})
export class UserEditComponent {
  id: string | null = null;
  model: any = null;
  saving = false;
  saved = false;
  error: string | null = null;
  constructor(private route: ActivatedRoute, private facade: UsersFacade) {
    this.id = route.snapshot.paramMap.get('id');
    this.load();
  }

  private async load() {
    // Users API surface is limited; initialize defaults
    this.model = { displayName: '', email: '' };
  }

  async save() {
    this.saving = true;
    this.saved = false;
    this.error = null;
    try {
      // Placeholder: no users POST/PUT on Client; implement when API available
      await Promise.resolve();
      this.saved = true;
    } catch (err: any) {
      this.error = err?.message ?? 'Save failed';
    } finally {
      this.saving = false;
    }
  }
}
