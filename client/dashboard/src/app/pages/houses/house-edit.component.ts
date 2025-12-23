import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HousesFacade } from '../../features/houses/houses.facade';

@Component({
  standalone: true,
  selector: 'house-edit',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="edit-shell">
      <h3>House Edit</h3>
      <p *ngIf="id">Editing house ID: {{ id }}</p>
      <form *ngIf="model">
        <label>Name<br /><input name="name" [(ngModel)]="model.name" /></label><br />
        <label>Description<br /><textarea name="description" [(ngModel)]="model.description"></textarea></label><br />
        <label>Line 1<br /><input name="line1" [(ngModel)]="model.line1" /></label>
        <label>City<br /><input name="city" [(ngModel)]="model.city" /></label>
        <label>Country<br /><input name="country" [(ngModel)]="model.country" /></label>
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
export class HouseEditComponent {
  id: string | null = null;
  model: any = null;
  saving = false;
  saved = false;
  error: string | null = null;
  constructor(private route: ActivatedRoute, private facade: HousesFacade) {
    this.id = route.snapshot.paramMap.get('id');
    this.load();
  }

  private async load() {
    try {
      if (this.id) {
        const res = await this.facade.get(this.id);
        this.model = res ? { ...res } : { name: '', description: '' };
      } else {
        this.model = { name: '', description: '' };
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
