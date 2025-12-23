import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthFacade } from '../auth/auth.facade';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly auth = inject(AuthFacade);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.auth.accessToken();
    if (!token) return next.handle(req);
    const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    return next.handle(cloned);
  }
}
