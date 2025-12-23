import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private readonly toast = inject(ToastService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((err: any) => {
        console.error('HTTP error intercepted', err);
        if (err instanceof HttpErrorResponse) {
          const normalized = {
            status: err.status,
            message: err.error?.message ?? err.message ?? 'An error occurred',
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
