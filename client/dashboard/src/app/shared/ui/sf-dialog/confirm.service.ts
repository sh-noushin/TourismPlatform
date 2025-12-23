import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { SfDialogComponent, SfDialogData } from './sf-dialog.component';

export interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  constructor(private readonly dialog: MatDialog) {}

  confirm(options: ConfirmOptions = {}): Promise<boolean> {
    const dialogRef = this.dialog.open(SfDialogComponent, {
      data: options as SfDialogData,
      width: '420px'
    });

    return firstValueFrom(dialogRef.afterClosed()).then((result) => result === true);
  }
}
