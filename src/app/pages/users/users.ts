import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../core/services/auth.service'; // ← Cambiar por AuthService
import { CreateUser } from '../create-user/create-user';
import { UserService } from './../../core/services/user.service';
import { UserResponseDTO } from '../../core/dto/user-response.dto';
import { EmployeeService } from '../../core/services/employee.service';
import { Employee } from '../../interfaces/employee.interface';
import { DepartmentService } from '../../core/services/department.service';
import { forkJoin, Observable } from 'rxjs';
import { UserRequestDTO } from '../../core/dto/user-request.dto';
import { User } from '../../interfaces/user.interface';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, CreateUser],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
})
export class Users implements OnInit, AfterViewInit {
  @ViewChild(CreateUser) createUserModal!: CreateUser;

  users: UserResponseDTO[] = [];
  filteredUsers: UserResponseDTO[] = [];
  searchTerm: string = '';
  roleFilter: string = '';
  statusFilter: string = '';
  employeesCanBeUsers: Employee[] = [];

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;

  // Statistics
  userStats: UserStats = {
    total: 0,
    active: 0,
    admins: 0,
    hr: 0,
    employees: 0,
    inactive: 0,
  };

  allowedDepartmentIds: number[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService
  ) {}

  ngOnInit() {
    this.loadDepartmentsEmployeesAndUsers();
  }

  ngAfterViewInit() {
    console.log('✅ CreateUserModal disponible:', this.createUserModal);
  }

  // Comprobar que empleados pueden ser usuarios
  private loadDepartmentsEmployeesAndUsers() {
    forkJoin({
      departments: this.departmentService.getAllDepartments(),
      employees: this.employeeService.getAll(),
      users: this.userService.getAllUsers(),
    }).subscribe({
      next: ({ departments, employees, users }) => {
        this.users = users;

        const allowedNames = ['dirección', 'direccion', 'recursos humanos'];
        this.allowedDepartmentIds = departments
          .filter((d) => allowedNames.includes((d.name || '').trim().toLowerCase()))
          .map((d) => d.id);

        this.employeesCanBeUsers = (employees || []).filter((emp) => {
          const deptId = emp.department_id ?? null;
          const empHasUser = (this.users || []).some((u) => u.employeeId === emp.id);
          return (
            !empHasUser && deptId !== null && this.allowedDepartmentIds.includes(Number(deptId))
          );
        });

        // actualizar stats / UI
        this.filteredUsers = [...this.users];
        this.calculateStats();
      },
      error: (err) => {
        console.error('Error cargando datos para users/employees/departments:', err);
        // fallback: intentar cargar por separado o mostrar mensaje
      },
    });
  }

  filterUsers() {
    this.filteredUsers = this.users.filter((user) => {
      const matchesSearch =
        !this.searchTerm ||
        user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (user.employeeName &&
          user.employeeName.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesRole = !this.roleFilter || user.roles.includes(this.roleFilter);

      const matchesStatus =
        !this.statusFilter ||
        (this.statusFilter === 'active' && user.active) ||
        (this.statusFilter === 'inactive' && !user.active);

      return matchesSearch && matchesRole && matchesStatus;
    });

    this.currentPage = 1; // Reset to first page on filter
  }

  calculateStats() {
    this.userStats = {
      total: this.users.length,
      active: this.users.filter((user) => user.active).length,
      admins: this.users.filter((user) => user.roles.includes('ROLE_ADMIN')).length,
      hr: this.users.filter((user) => user.roles.includes('ROLE_HR')).length,
      employees: this.users.filter((user) => user.roles.includes('ROLE_EMPLOYEE')).length,
      inactive: this.users.filter((user) => !user.active).length,
    };
  }

  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      ROLE_ADMIN: 'Admin',
      ROLE_HR: 'RH',
      ROLE_EMPLOYEE: 'Empleado',
    };
    return roleNames[role] || role;
  }

  hasPermission(permission: string): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }

  viewUser(user: User) {
    console.log('Ver detalles de usuario:', user);
  }

  resetPassword(userId: number) {
    if (confirm('¿Estás seguro de que quieres resetear la contraseña de este usuario?')) {
      console.log('Resetear contraseña para usuario:', userId);
    }
  }

  toggleUserStatus(user: User) {
    const action = user.active ? 'desactivar' : 'activar';
    if (confirm(`¿Estás seguro de que quieres ${action} este usuario?`)) {
      console.log(`${action} usuario:`, user.id);
      // Implementar cambio de estado
    }
  }

  exportUsers() {
    console.log('Exportar usuarios a CSV/Excel');
  }

  nextPage() {
    if (this.currentPage * this.pageSize < this.filteredUsers.length) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  get paginatedUsers() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(startIndex, startIndex + this.pageSize);
  }

  openCreateModal() {
    console.log('🎯 Abriendo modal desde Users...');
    if (this.createUserModal) {
      this.createUserModal.openCreateModal();
    } else {
      console.error('❌ CreateUserModal no disponible');
    }
  }

  editUser(user: any) {
    if (this.createUserModal) {
      this.createUserModal.editUser(user);
    }
  }

  onSaveUser(dto: any) {
    this.userService.createUser(dto).subscribe({
      next: () => {
        alert('Usuario creado');
        this.loadDepartmentsEmployeesAndUsers(); // refrescar
      },
      error: (err) => console.error('Error creating user', err),
    });
  }
}
