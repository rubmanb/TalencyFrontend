import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import {
  AuthResponse,
  AuthRequest,
  RefreshTokenResponse,
  RefreshTokenRequest,
} from '../../auth/auth.model';
import { AuthUser } from '../../auth/auth-user.interface';
import { User } from '../../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'talency_access_token';
  private readonly REFRESH_TOKEN_KEY = 'talency_refresh_token';
  private readonly USER_KEY = 'talency_user';
  private readonly TOKEN_EXPIRY_KEY = 'talency_token_expiry';

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    // Solo cargar del localStorage en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserFromStorage();
    }
  }

  /**
   * Login del usuario
   */
  login(company: string, username: string, password: string): Observable<AuthResponse> {
    const authRequest: AuthRequest = { company, username, password };
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, authRequest).pipe(
      tap((response) => {
        this.saveSession(response, username, company);
      }),
      catchError((error) => {
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  /**
   * Refresh del token
   */
  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const request: RefreshTokenRequest = { refreshToken };

    return this.http.post<RefreshTokenResponse>(`${this.API_URL}/refresh`, request).pipe(
      tap((response) => {
        this.saveAccessToken(response.accessToken);
      }),
      catchError((error) => {
        // Si el refresh token falla, hacer logout
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout
   */
  logout(): void {
    const refreshToken = this.getRefreshToken();

    if (refreshToken) {
      // Intentar enviar logout al backend (pero no bloquear si falla)
      this.http.post(`${this.API_URL}/logout`, { refreshToken }).subscribe({
        error: () => console.warn('Logout request failed, clearing session locally'),
      });
    }

    this.clearSession();
    this.router.navigate(['/login']);
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const expiry = this.getTokenExpiry();

    if (!token || !expiry) {
      return false;
    }

    // Verificar si el token ha expirado
    const now = Date.now();
    return now < expiry;
  }

  /**
   * Verificar si necesita refresh (5 minutos antes de expirar)
   */
  shouldRefreshToken(): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) return false;

    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    return now > expiry - fiveMinutes;
  }

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtener refresh token
   */
  getRefreshToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Obtener usuario actual (AuthUser)
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtener roles del usuario
   */
  getRoles(): string[] {
    const user = this.currentUserSubject.value;
    return user?.roles || [];
  }

  /**
   * Verificar si tiene un rol específico
   */
  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  /**
   * Verificar si tiene alguno de los roles
   */
  hasAnyRole(roles: string[]): boolean {
    return this.getRoles().some((role) => roles.includes(role));
  }

  /**
   * Cargar perfil completo del usuario (User)
   * Este método lo llamarías después del login para obtener datos adicionales
   */
  loadUserProfile(): Observable<User> {
    return this.http.get<User>('/api/users/profile').pipe(
      tap((profile) => {
        // Combinar AuthUser con User profile
        const currentAuth = this.currentUserSubject.value;
        if (currentAuth) {
          // Aquí podrías actualizar el AuthUser con datos adicionales si es necesario
          // Pero mantén la separación clara entre AuthUser y User
          console.log('User profile loaded:', profile);
        }
      })
    );
  }

  // ==================== MÉTODOS PRIVADOS ====================

  private saveSession(response: AuthResponse, username: string, company: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const expiresIn = response.expiresIn || 86400000;
    const expiresAt = Date.now() + expiresIn;

    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiresAt.toString());

    // Crear AuthUser con datos mínimos para autenticación
    const authUser: AuthUser = {
      username: response.username || username,
      company: response.company || company,
      roles: response.roles || [],
      token: response.accessToken,
      refreshToken: response.refreshToken,
      expiresAt,
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(authUser));
    this.currentUserSubject.next(authUser);
  }

  private saveAccessToken(accessToken: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const expiresIn = 86400000; // 24h
    const expiresAt = Date.now() + expiresIn;

    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiresAt.toString());

    // Actualizar AuthUser en memoria
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      const updatedUser: AuthUser = {
        ...currentUser,
        token: accessToken,
        expiresAt,
      };
      localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
    }
  }

  private loadUserFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        const user: AuthUser = JSON.parse(userStr);
        // Verificar que el token no haya expirado
        if (user.expiresAt && user.expiresAt > Date.now()) {
          this.currentUserSubject.next(user);
        } else {
          this.clearSession();
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        this.clearSession();
      }
    }
  }

  /**
   * Obtener el nombre de usuario
   */
  getUsername(): string {
    const user = this.currentUserSubject.value;
    return user?.username || '';
  }

  /**
   * Obtener el nombre de la compañía
   */
  getCompanyName(): string {
    const user = this.currentUserSubject.value;
    return user?.company || '';
  }

  private getTokenExpiry(): number | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const expiryStr = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    return expiryStr ? parseInt(expiryStr, 10) : null;
  }

  private clearSession(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);

    this.currentUserSubject.next(null);
  }
}
