import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

import { ToastService } from '../ui/toast.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private readonly toast: ToastService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<HttpEvent<unknown>> {
    const message = this.normalize(error);
    this.toast.show(message, 'error');
    return throwError(() => error);
  }

  private normalize(error: HttpErrorResponse): string {
    if (error.error && typeof error.error === 'object' && 'message' in error.error) {
      return (error.error as { message?: string }).message ?? 'An unexpected error occurred';
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }
}