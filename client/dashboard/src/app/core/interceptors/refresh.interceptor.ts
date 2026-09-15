import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthFacade } from '../auth/auth.facade';
import { Router } from '@angular/router';

@Injectable()
export class RefreshInterceptor implements HttpInterceptor {
  // single-flight refresh promise (resolves to boolean indicating success)
  private refreshing: Promise<boolean> | null = null;
  private readonly auth: AuthFacade;
  private readonly router: Router;

  constructor(auth?: AuthFacade, router?: Router) {
    if (auth && router) {
      this.auth = auth;
      this.router = router;
    } else {
      this.auth = inject(AuthFacade);
      this.router = inject(Router);
    }
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // If this request opted out of refresh handling, forward directly
    if (req.headers.get('x-skip-refresh')) return next.handle(req);

    // The auth endpoints are how a refresh is performed, so a 401 from one of
    // them must never start another refresh: that is a loop, and it is what
    // swallowed the original error instead of sending the user back to login.
    if (/\/api\/auth\//i.test(req.url)) return next.handle(req);

    // If this request has already been retried, don't attempt refresh again
    if (req.headers.get('x-retried') === '1') return next.handle(req);

    return next.handle(req).pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          // avoid retry loops: don't attempt refresh for retry attempts
          if (req.headers.get('x-retried') === '1') return throwError(() => err);

          // start single-flight refresh if not already running
          if (!this.refreshing) {
            this.refreshing = this.auth
              .refresh()
              .then(() => true)
              .catch(() => false)
              .finally(() => {
                // clearing is safe here; consumers use the resolved boolean
                this.refreshing = null;
              });
          }

          return from(this.refreshing).pipe(
            switchMap((ok) => {
              if (!ok) {
                // Refresh failed: the session is genuinely over. Clear it
                // locally -- no request, nothing left to authenticate with --
                // send the user to login, and rethrow so the caller's promise
                // rejects and its spinner stops.
                this.auth.clearSession();
                this.router.navigate(['/login']);
                return throwError(() => err);
              }
              // refreshed successfully; obtain latest token and retry once
              const token = this.auth.accessToken();
              if (!token) {
                this.auth.clearSession();
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
