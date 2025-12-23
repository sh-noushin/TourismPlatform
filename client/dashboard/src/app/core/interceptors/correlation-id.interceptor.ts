import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

function generateCorrelationId(): string {
  try {
    const crypto = (globalThis as any).crypto;
    if (crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch {}
  return 'cid-' + Math.random().toString(36).slice(2);
}

@Injectable()
export class CorrelationIdInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (req.headers.has('X-Correlation-ID')) return next.handle(req);
    const cloned = req.clone({ setHeaders: { 'X-Correlation-ID': generateCorrelationId() } });
    return next.handle(cloned);
  }
}
