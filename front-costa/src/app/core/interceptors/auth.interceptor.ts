import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly excludedEndpoints = ['/v1/auth/login', '/v1/auth/register'];

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.shouldSkip(req.url)) {
      return next.handle(req);
    }

    const token = this.getToken();
    if (!token) {
      return next.handle(req);
    }

    const authRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next.handle(authRequest);
  }

  private shouldSkip(url: string): boolean {
    return this.excludedEndpoints.some((endpoint) => url.includes(endpoint));
  }

  private getToken(): string | null {
    return sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
  }
}
