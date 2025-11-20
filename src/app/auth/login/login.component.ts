import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData = {
    company: '',
    username: '',
    password: ''
  };

  errorMessage: string | null = null;
  isLoading: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    // Reset error
    this.errorMessage = null;

    // Basic validation
    if (!this.loginData.company || !this.loginData.username.trim() || !this.loginData.password.trim()) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    this.isLoading = true;

    this.http.post<any>('http://localhost:8080/api/auth/login', this.loginData)
      .subscribe({
        next: (response) => {
          this.isLoading = false;

          // Save token and user data
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify({
            username: this.loginData.username,
            roles: response.roles
          }));

          // Redirect based on role
          this.redirectByRole(response.roles);
        },
        error: (error) => {
          this.isLoading = false;

          switch(error.status){
            case 401:
              this.errorMessage = 'Usuario o contraseña incorrectos';
              break;
            case 403:
              this.errorMessage = 'No tienes permisos para acceder al sistema';
              break;
            case 500:
              this.errorMessage = 'Error del servidor. Por favor, intenta más tarde.';
              break;
            case 0:
              this.errorMessage = 'No se puede conectar con el servidor. Verifica que el backend esté ejecutándose.';
              break;
            default:
              this.errorMessage = 'Error desconocido. Por favor, intenta más tarde.';
              break;
          }
        }
      });
  }

  private redirectByRole(roles: string[]) {
    if (roles.includes('ROLE_ADMIN')) {
      this.router.navigate(['/dashboard']);
    } else if (roles.includes('ROLE_HR')) {
      this.router.navigate(['/employees']);
    } else if (roles.includes('ROLE_EMPLOYEE')) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  // Clear error when user starts typing
  onInputChange() {
    if (this.errorMessage) {
      this.errorMessage = null;
    }
  }
}
