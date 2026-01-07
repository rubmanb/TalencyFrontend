import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthRequestRegister } from '../auth.model';

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

  confirmPassword: string = '';

  registerData: AuthRequestRegister = {
    // company: '',
    // username: '',
    email: '',
    password: '',
    // subscription: 'FREE' as 'FREE' | 'STANDARD' | 'PREMIUM',
  };

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(): void {
    this.errorMessage = null;

    // const { company, username, password, confirmPassword, subscription } = this.registerData;
    const { email, password } = this.registerData;

    // if (!company || !username || !password || !confirmPassword) {
    //   this.errorMessage = 'Todos los campos son obligatorios';
    //   return;
    // }
    if (!email || !password) {
      this.errorMessage = 'Todos los campos son obligatorios';
      return;
    }

    if (password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.isLoading = true;

    const dto: AuthRequestRegister = {
      // company,
      // username,
      // subscription,
      email,
      password,
      // confirmPassword: '',
    };

    this.authService.register(dto).subscribe({
      next: () => {
        this.isLoading = false;
        console.log('Registro exitoso', dto.email);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        console.log(dto.email); // vacio
        this.errorMessage = err?.error?.message || 'Error al registrar la empresa';
      },
    });
  }
}
