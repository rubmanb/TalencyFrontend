import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  isLoading = false;
  errorMessage: string | null = null;

  registerData = {
    company: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    suscriptionPlan: 'Free',
    roleIds: 1, // Default role ID for new users
  };

  constructor(private router: Router, private userService: UserService) {}

  onRegister(): void {
    this.errorMessage = null;

    if (
      !this.registerData.company ||
      !this.registerData.email ||
      !this.registerData.username ||
      !this.registerData.password ||
      !this.registerData.confirmPassword
    ) {
      this.errorMessage = 'Todos los campos son obligatorios';
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.isLoading = true;

    const dto = {
      company: this.registerData.company,
      email: this.registerData.email,
      username: this.registerData.username,
      password: this.registerData.password,
      roleIds: [this.registerData.roleIds],
    };

    this.userService.createUser(dto).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Error al crear la cuenta';
      },
    });
  }
}
