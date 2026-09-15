import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  /**
   * What the reader is told. A raw Angular message names the method, the URL
   * and the port -- "Http failure response for http://localhost:5266/api/...:
   * 401 Unauthorized" -- which tells an operator nothing they can act on. The
   * status is what matters: 401 means sign in again, 403 means you may not,
   * 5xx means it is not your fault.
   */
  private friendlyMessage(err: HttpErrorResponse): string {
    const serverMessage = (err.error?.message ?? '').toString().trim();

    const key =
      err.status === 0 ? 'ERRORS.NETWORK'
      : err.status === 401 ? 'ERRORS.SESSION_EXPIRED'
      : err.status === 403 ? 'ERRORS.FORBIDDEN'
      : err.status === 404 ? 'ERRORS.NOT_FOUND'
      : err.status >= 500 ? 'ERRORS.SERVER'
      : null;

    if (key) {
      const translated = this.translate.instant(key);
      // instant() echoes the key back when the bundle has not loaded yet.
      if (translated && translated !== key) return translated;
    }

    // A message the API itself wrote is written for a human; prefer it over
    // anything generated here.
    return serverMessage || this.translate.instant('ERRORS.GENERIC');
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((err: any) => {
        console.error('HTTP error intercepted', err);
        if (err instanceof HttpErrorResponse) {
          const normalized = {
            status: err.status,
            message: this.friendlyMessage(err),
            error: err.error
          };
          // show friendly toast
          const level: 'info' | 'success' | 'warning' | 'danger' =
            normalized.status >= 500 ? 'danger' : normalized.status >= 400 ? 'warning' : 'info';
          try {
            this.toast.show(normalized.message, level);
          } catch (toastErr) {
            console.warn('Toast show failed', toastErr);
          }
          return throwError(() => normalized);
        }
        try {
          this.toast.show('Network error', 'danger');
        } catch {}
        return throwError(() => err);
      })
    );
  }
}
