import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((err: any) => {
        // TODO: hook into app ToastService to present friendly messages
        console.error('HTTP error intercepted', err);
        if (err instanceof HttpErrorResponse) {
          const normalized = {
            status: err.status,
            message: err.error?.message ?? err.message ?? 'An error occurred',
            error: err.error
          };
          return throwError(() => normalized);
        }
        return throwError(() => err);
      })
    );
  }
}
