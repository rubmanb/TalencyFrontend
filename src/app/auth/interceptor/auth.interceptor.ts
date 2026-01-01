import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, from } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(
    null
  );

  constructor(private authService: AuthService, @Inject(PLATFORM_ID) private platformId: any) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // No interceptar requests de login/refresh
    if (req.url.includes('/api/auth/login') || req.url.includes('/api/auth/refresh')) {
      return next.handle(req);
    }

    // Solo en navegador
    if (isPlatformBrowser(this.platformId)) {
      // Verificar si necesita refresh
      if (this.authService.shouldRefreshToken()) {
        return this.handleTokenRefresh(req, next);
      }
    }

    return this.addTokenToRequest(req, next).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && isPlatformBrowser(this.platformId)) {
          return this.handle401Error(req, next, error);
        }
        return throwError(() => error);
      })
    );
  }

  private addTokenToRequest(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    if (token) {
      const cloned = req.clone({
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }),
      });
      return next.handle(cloned);
    }

    return next.handle(req);
  }

  private handleTokenRefresh(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return from(this.authService.refreshToken().toPromise()).pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response.accessToken);
          return this.addTokenToRequest(req, next);
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => error);
        })
      );
    } else {
      // Esperar a que termine el refresh en curso
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap(() => this.addTokenToRequest(req, next))
      );
    }
  }

  private handle401Error(
    req: HttpRequest<any>,
    next: HttpHandler,
    error: HttpErrorResponse
  ): Observable<HttpEvent<any>> {
    // Si es un error 401 y tenemos refresh token, intentar refresh
    if (this.authService.getRefreshToken() && req.url !== '/api/auth/login') {
      return this.handleTokenRefresh(req, next);
    }

    // Si no hay refresh token o falla, hacer logout
    this.authService.logout();
    return throwError(() => error);
  }
}
