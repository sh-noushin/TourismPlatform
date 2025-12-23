import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PermissionsFacade } from '../../features/permissions/permissions.facade';

@Component({
  standalone: true,
  selector: 'permission-edit',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="edit-shell">
      <h3>Permission Edit</h3>
      <p *ngIf="id">Editing permission ID: {{ id }}</p>
      <form *ngIf="model">
        <label>Code<br /><input name="code" [(ngModel)]="model.code" /></label><br />
        <label>Description<br /><input name="description" [(ngModel)]="model.description" /></label><br />
        <label>Enabled <input type="checkbox" name="isEnabled" [(ngModel)]="model.isEnabled" /></label>
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
export class PermissionEditComponent {
  id: string | null = null;
  model: any = null;
  saving = false;
  saved = false;
  error: string | null = null;
  constructor(private route: ActivatedRoute, private facade: PermissionsFacade) {
    this.id = route.snapshot.paramMap.get('id');
    this.load();
  }

  private async load() {
    try {
      if (this.id) {
        const res = await this.facade.get(this.id);
        this.model = res ? { ...res } : { code: '', description: '', isEnabled: true };
      } else {
        this.model = { code: '', description: '', isEnabled: true };
      }
    } catch (err: any) {
      this.error = err?.message ?? 'Failed loading';
    }
  }

  async save() {
    this.saving = true;
    this.saved = false;
    this.error = null;
    try {
      await this.facade.save(this.id, this.model);
      this.saved = true;
    } catch (err: any) {
      this.error = err?.message ?? 'Save failed';
    } finally {
      this.saving = false;
    }
  }
}
