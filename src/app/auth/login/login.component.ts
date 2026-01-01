import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthRequest } from '../auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginData: AuthRequest = {
    company: '',
    username: '',
    password: '',
  };

  errorMessage: string | null = null;
  isLoading = false;
  rememberMe = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Si ya está autenticado, redirigir
    if (this.authService.isAuthenticated()) {
      this.redirectByRole();
    }
  }

  onLogin(): void {
    // Validación básica
    if (!this.validateForm()) {
      return;
    }

    this.errorMessage = null;
    this.isLoading = true;

    this.authService
      .login(this.loginData.company, this.loginData.username, this.loginData.password)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.redirectByRole();
        },
        error: (error) => {
          this.isLoading = false;
          this.handleError(error);
        },
      });
  }

  private validateForm(): boolean {
    if (!this.loginData.company?.trim()) {
      this.errorMessage = 'El nombre de la empresa es requerido';
      return false;
    }

    if (!this.loginData.username?.trim()) {
      this.errorMessage = 'El nombre de usuario es requerido';
      return false;
    }

    if (!this.loginData.password?.trim()) {
      this.errorMessage = 'La contraseña es requerida';
      return false;
    }

    return true;
  }

  private redirectByRole(): void {
    const user = this.authService.getCurrentUser();
    const roles = user?.roles || [];

    if (roles.includes('ADMIN') || roles.includes('HR')) {
      this.router.navigate(['/dashboard']);
    } else if (roles.includes('EMPLOYEE')) {
      this.router.navigate(['/profile']);
    } else {
      // Rol por defecto
      this.router.navigate(['/dashboard']);
    }
  }

  private handleError(error: any): void {
    console.error('Login error:', error);

    if (error.status === 401) {
      this.errorMessage = 'Credenciales inválidas. Verifique su empresa, usuario y contraseña.';
    } else if (error.status === 403) {
      this.errorMessage = 'No tiene permisos para acceder al sistema.';
    } else if (error.status === 0) {
      this.errorMessage =
        'No se puede conectar con el servidor. Verifique que el backend esté ejecutándose.';
    } else if (error.status >= 500) {
      this.errorMessage = 'Error del servidor. Por favor, intente más tarde.';
    } else if (error.error?.message) {
      this.errorMessage = error.error.message;
    } else {
      this.errorMessage = 'Error desconocido. Por favor, intente nuevamente.';
    }
  }

  onInputChange(): void {
    if (this.errorMessage) {
      this.errorMessage = null;
    }
  }
}
