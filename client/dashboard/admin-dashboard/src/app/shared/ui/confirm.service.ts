import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { map, Observable } from 'rxjs';

import { SfConfirmDialogComponent, ConfirmDialogOptions } from './sf-confirm-dialog/sf-confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  constructor(private readonly dialog: MatDialog) {}

  confirm(options: ConfirmDialogOptions = {}): Observable<boolean> {
    const dialogRef = this.dialog.open(SfConfirmDialogComponent, {
      data: options,
      width: '420px',
      maxWidth: '100%',
      autoFocus: false
    });

    return dialogRef.afterClosed().pipe(map((result) => !!result));
  }
}
