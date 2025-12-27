import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface LoginResponse {
  token: string;
  username: string;
  roles: string[];
  type: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Cargar usuario al iniciar
    const user = this.getUser();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  // login(username: string, password: string): Observable<LoginResponse> {
  //   return this.http.post<LoginResponse>('/api/auth/login', { username, password })
  //     .pipe(
  //       tap(response => {
  //         if (response.token) {
  //           const user = {
  //             username: response.username,
  //             roles: response.roles || []
  //           };
  //           this.setToken(response.token);
  //           this.setUser(user);
  //           this.currentUserSubject.next(user);
  //         }
  //       })
  //     );
  // }
  login(username: string, password: string, company: string): Observable<LoginResponse> {
    const composite = `${company}|${username}`;
    return this.http.post<LoginResponse>('/api/auth/login', { username: composite, password });
  }


  logout(): void {
    this.clearSession();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  getUsername(): string {
    const user = this.getUser();
    return user?.username || 'Usuario';
  }

  getRoles(): string[] {
    const user = this.getUser();
    return user?.roles || [];
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  hasRole(role: string): boolean {
    const roles = this.getRoles();
    return roles.includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getRoles();
    return roles.some(role => userRoles.includes(role));
  }

  // Métodos directos de localStorage (sin SSR)
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  private removeToken(): void {
    localStorage.removeItem('token');
  }

  private getUser(): any {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  }

  getCompanyName(): string | null {
    return localStorage.getItem('company_name');
  }

  private setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  private removeUser(): void {
    localStorage.removeItem('user');
  }

  private clearSession(): void {
    this.removeToken();
    this.removeUser();
  }
}
