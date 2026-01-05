import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RegisterFormDto } from '../../core/dto/register--form.dto';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  isLoading = false;
  errorMessage: string | null = null;

  registerData: RegisterFormDto = {
    company: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    subscription: 'FREE' as 'FREE' | 'STANDARD' | 'PREMIUM',
  };

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(): void {
    this.errorMessage = null;

    const { company, username, password, confirmPassword, subscription } = this.registerData;

    if (!company || !username || !password || !confirmPassword) {
      this.errorMessage = 'Todos los campos son obligatorios';
      return;
    }

    if (password !== confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.isLoading = true;

    const dto: RegisterFormDto = {
      company,
      username,
      password,
      subscription,
      email: '',
      confirmPassword: '',
    };

    this.authService.register(dto).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Error al registrar la empresa';
      },
    });
  }
}
