import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { RefreshInterceptor } from './refresh.interceptor';

describe('RefreshInterceptor', () => {
  let interceptor: RefreshInterceptor;

  function makeFakeAuth() {
    let token: string | null = null;
    return {
      accessToken: () => token,
      refresh: jasmine.createSpy('refresh').and.callFake(() => {
        return new Promise((resolve, reject) => {
          // simulate async refresh that sets token
          setTimeout(() => {
            token = 'new-token';
            resolve({ accessToken: token });
          }, 10);
        });
      }),
      logout: jasmine.createSpy('logout').and.returnValue(Promise.resolve())
    } as any;
  }

  const fakeRouter = { navigate: jasmine.createSpy('navigate') } as any;

  it('retries once after successful refresh', (done) => {
    const fakeAuth = makeFakeAuth();
    interceptor = new RefreshInterceptor(fakeAuth as any, fakeRouter as any);

    const handler = {
      handle: (req: HttpRequest<any>) => {
        if (req.headers.get('x-retried') === '1') {
          return of(new HttpResponse({ status: 200 } as any));
        }
        return throwError(() => new HttpErrorResponse({ status: 401 }));
      }
    } as any;

    const req = new HttpRequest('GET', '/test');
    interceptor.intercept(req, handler).subscribe({
      next: (res: any) => {
        expect(res.status).toBe(200);
        expect(fakeAuth.refresh).toHaveBeenCalledTimes(1);
        done();
      },
      error: (err) => done.fail(err)
    });
  });

  it('queues concurrent requests and performs single refresh', (done) => {
    const fakeAuth = makeFakeAuth();
    interceptor = new RefreshInterceptor(fakeAuth as any, fakeRouter as any);

    const handler = {
      handle: (req: HttpRequest<any>) => {
        if (req.headers.get('x-retried') === '1') {
          return of(new HttpResponse({ status: 200 } as any));
        }
        return throwError(() => new HttpErrorResponse({ status: 401 }));
      }
    } as any;

    const req1 = new HttpRequest('GET', '/a');
    const req2 = new HttpRequest('GET', '/b');

    let resCount = 0;
    interceptor.intercept(req1, handler).subscribe({ next: () => { resCount++; if (resCount === 2) finish(); }, error: done.fail });
    interceptor.intercept(req2, handler).subscribe({ next: () => { resCount++; if (resCount === 2) finish(); }, error: done.fail });

    function finish() {
      expect(fakeAuth.refresh).toHaveBeenCalledTimes(1);
      done();
    }
  });
});
