import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, catchError, finalize, shareReplay, switchMap, throwError } from 'rxjs';

import { AuthFacade } from '../auth/auth.facade';

@Injectable()
export class RefreshInterceptor implements HttpInterceptor {
  private refresh$?: Observable<unknown>;

  constructor(private readonly authFacade: AuthFacade) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error) => this.handleError(error, req, next))
    );
  }

  private handleError(error: HttpErrorResponse, req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.shouldRefresh(error)) {
      return throwError(() => error);
    }

    return this.getRefreshObservable().pipe(
      switchMap(() => next.handle(req)),
      catchError((refreshError) => {
        this.authFacade.logout().subscribe({});
        return throwError(() => refreshError);
      })
    );
  }

  private shouldRefresh(error: HttpErrorResponse): boolean {
    return error.status === 401 && this.authFacade.isAuthenticated();
  }

  private getRefreshObservable(): Observable<unknown> {
    if (!this.refresh$) {
      this.refresh$ = this.authFacade.refreshIfNeeded().pipe(
        finalize(() => this.refresh$ = undefined),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.refresh$;
  }
}