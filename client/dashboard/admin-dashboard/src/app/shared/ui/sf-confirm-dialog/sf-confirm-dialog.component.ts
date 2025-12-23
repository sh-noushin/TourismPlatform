import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { SfButtonComponent } from '../sf-button/sf-button.component';
import { SfDialogComponent } from '../sf-dialog/sf-dialog.component';

export interface ConfirmDialogOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

@Component({
  standalone: true,
  selector: 'sf-confirm-dialog',
  imports: [CommonModule, SfDialogComponent, SfButtonComponent],
  templateUrl: './sf-confirm-dialog.component.html',
  styleUrl: './sf-confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SfConfirmDialogComponent {
  constructor(
    private readonly dialogRef: MatDialogRef<SfConfirmDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public readonly data: ConfirmDialogOptions
  ) {}

  onConfirm() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
