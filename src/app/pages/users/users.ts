import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service'; // ← Cambiar por AuthService
import { CreateUser } from '../create-user/create-user';

interface User {
  id: number;
  username: string;
  email: string;
  employeeName?: string;
  roles: string[];
  lastLogin?: string;
  active: boolean;
  createdAt: string;
}

interface UserStats {
  total: number;
  active: number;
  admins: number;
  hr: number;
  employees: number;
  inactive: number;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, CreateUser],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class Users implements OnInit, AfterViewInit {

  @ViewChild(CreateUser) createUserModal!: CreateUser;

  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  roleFilter: string = '';
  statusFilter: string = '';

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
    inactive: 0
  };

  constructor(private authService: AuthService) {} // ← Cambiar por AuthService

  ngOnInit() {
    this.loadUsers();
  }

  ngAfterViewInit() {
    console.log('✅ CreateUserModal disponible:', this.createUserModal);
  }

  loadUsers() {
    // Simular carga de datos - reemplazar con API real
    this.users = [
      { id: 1, username: 'admin.maria', email: 'admin@empresa.com', employeeName: 'María García López', roles: ['ROLE_ADMIN'], lastLogin: '2024-10-04T10:30:00', active: true, createdAt: '2024-01-15' },
      { id: 2, username: 'rh.ana', email: 'rh.ana@empresa.com', employeeName: 'Ana Martínez Ruiz', roles: ['ROLE_HR'], lastLogin: '2024-10-04T09:15:00', active: true, createdAt: '2024-02-10' },
      { id: 3, username: 'carlos.dev', email: 'carlos@empresa.com', employeeName: 'Carlos Rodríguez Sánchez', roles: ['ROLE_EMPLOYEE'], lastLogin: '2024-10-03T16:45:00', active: true, createdAt: '2024-03-01' },
      { id: 4, username: 'laura.fin', email: 'laura@empresa.com', employeeName: 'Laura Sánchez Gómez', roles: ['ROLE_EMPLOYEE'], lastLogin: '2024-10-04T08:20:00', active: true, createdAt: '2024-03-15' },
      { id: 5, username: 'david.marketing', email: 'david@empresa.com', employeeName: 'David López Martín', roles: ['ROLE_EMPLOYEE'], lastLogin: '2024-10-02T14:30:00', active: false, createdAt: '2024-04-01' },
      { id: 6, username: 'marta.sales', email: 'marta@empresa.com', employeeName: 'Marta García Pérez', roles: ['ROLE_HR', 'ROLE_EMPLOYEE'], lastLogin: '2024-10-04T11:00:00', active: true, createdAt: '2024-04-15' }
    ];

    this.filteredUsers = [...this.users];
    this.calculateStats();
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm ||
        user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (user.employeeName && user.employeeName.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesRole = !this.roleFilter || user.roles.includes(this.roleFilter);

      const matchesStatus = !this.statusFilter ||
        (this.statusFilter === 'active' && user.active) ||
        (this.statusFilter === 'inactive' && !user.active);

      return matchesSearch && matchesRole && matchesStatus;
    });

    this.currentPage = 1; // Reset to first page on filter
  }

  calculateStats() {
    this.userStats = {
      total: this.users.length,
      active: this.users.filter(user => user.active).length,
      admins: this.users.filter(user => user.roles.includes('ROLE_ADMIN')).length,
      hr: this.users.filter(user => user.roles.includes('ROLE_HR')).length,
      employees: this.users.filter(user => user.roles.includes('ROLE_EMPLOYEE')).length,
      inactive: this.users.filter(user => !user.active).length
    };
  }

  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      'ROLE_ADMIN': 'Admin',
      'ROLE_HR': 'RH',
      'ROLE_EMPLOYEE': 'Empleado'
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
}
