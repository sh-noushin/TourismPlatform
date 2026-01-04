import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

export interface SfDialogData {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

@Component({
  standalone: true,
  selector: 'sf-dialog',
  templateUrl: './sf-dialog.component.html',
  styleUrls: ['./sf-dialog.component.scss'],
  imports: [CommonModule, MatDialogModule, MatButtonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SfDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SfDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SfDialogData
  ) {}

  confirm() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
