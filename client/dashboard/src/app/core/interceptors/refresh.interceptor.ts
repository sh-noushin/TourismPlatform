import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthFacade } from '../auth/auth.facade';
import { Router } from '@angular/router';

@Injectable()
export class RefreshInterceptor implements HttpInterceptor {
  private readonly auth = inject(AuthFacade);
  private readonly router = inject(Router);
  private refreshing: Promise<any> | null = null;

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // If this request opted out of refresh handling, forward directly
    if (req.headers.get('x-skip-refresh')) return next.handle(req);

    return next.handle(req).pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          if (!this.refreshing) {
            this.refreshing = this.auth.refresh().catch(() => null).finally(() => {
              this.refreshing = null as any;
            });
          }

          return from(this.refreshing).pipe(
            switchMap(() => {
              const token = this.auth.accessToken();
              if (!token) {
                // nothing to do, force logout
                this.auth.logout().catch(() => {});
                this.router.navigate(['/login']);
                return throwError(() => err);
              }
              const retried = req.clone({ setHeaders: { Authorization: `Bearer ${token}`, 'x-retried': '1' } });
              return next.handle(retried);
            })
          );
        }
        return throwError(() => err);
      })
    );
  }
}
