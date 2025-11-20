import { map, Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RoleService } from '../../core/services/role.service';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  position: string;
  email?: string;
}

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-user.html',
  styleUrls: ['./create-user.css']
})
export class CreateUser implements OnInit {
  userForm: FormGroup;
  employeeSearchControl = new FormControl();
  selectedEmployee: Employee | null = null;
  selectedRoles: string[] = [];
  showEmployeeResults: boolean = false;
  filteredEmployees: Employee[] = [];
  isEditing: boolean = false;
  isLoading: boolean = false;
  isModalOpen: boolean = false;

  employees: Employee[] = [
    { id: 1, firstName: 'María', lastName: 'García López', dni: '12345678A', position: 'Directora General' },
    { id: 2, firstName: 'Ana', lastName: 'Martínez Ruiz', dni: '87654321B', position: 'Especialista RH' },
    { id: 3, firstName: 'Carlos', lastName: 'Rodríguez Sánchez', dni: '11223344C', position: 'Desarrollador' },
    { id: 4, firstName: 'Laura', lastName: 'Sánchez Gómez', dni: '44332211D', position: 'Contadora' },
    { id: 5, firstName: 'David', lastName: 'López Martín', dni: '55667788E', position: 'Marketing Manager' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private roleService: RoleService
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit() {
    this.employeeSearchControl.valueChanges.subscribe(value => {
      this.onEmployeeSearch(value);
    });
  }

  openCreateModal() {
    this.isModalOpen = true;
    this.resetForm();
  }

  closeModal() {
    this.isModalOpen = false;
    this.resetForm();
  }

  private resetForm() {
    this.userForm.reset();
    this.selectedEmployee = null;
    this.selectedRoles = [];
    this.employeeSearchControl.setValue('');
    this.isEditing = false;
    this.showEmployeeResults = false;
    this.filteredEmployees = [];
  }

  createForm(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
    return null;
  }

  onEmployeeSearch(value: string) {
    if (value && value.length > 2) {
      this.filteredEmployees = this.employees.filter(employee =>
        employee.firstName.toLowerCase().includes(value.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(value.toLowerCase()) ||
        employee.dni.includes(value) ||
        employee.position.toLowerCase().includes(value.toLowerCase())
      );
      this.showEmployeeResults = true;
    } else {
      this.filteredEmployees = [];
      this.showEmployeeResults = false;
    }
  }

  onEmployeeSelected(employee: Employee) {
    this.selectedEmployee = employee;
    this.showEmployeeResults = false;
    this.employeeSearchControl.setValue(`${employee.firstName} ${employee.lastName}`);

    if (!this.userForm.get('username')?.value) {
      const username = this.generateUsername(employee);
      this.userForm.patchValue({ username });
    }

    if (!this.userForm.get('email')?.value && employee.email) {
      this.userForm.patchValue({ email: employee.email });
    }
  }

  generateUsername(employee: Employee): string {
    const firstPart = employee.firstName.toLowerCase().charAt(0);
    const lastPart = employee.lastName.toLowerCase().split(' ')[0];
    return `${firstPart}.${lastPart}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  onRoleChange(event: any) {
    const role = event.target.value;
    const isChecked = event.target.checked;

    if (isChecked) {
      this.selectedRoles.push(role);
    } else {
      this.selectedRoles = this.selectedRoles.filter(r => r !== role);
    }
  }

  onSubmit() {
    if (this.userForm.valid && this.selectedEmployee && this.selectedRoles.length > 0) {
      this.isLoading = true;

      const formData = {
        employeeId: this.selectedEmployee.id,
        username: this.userForm.value.username,
        email: this.userForm.value.email,
        password: this.userForm.value.password,
        roleIds: this.selectedRoles.map(role => this.getRoleId(role))
      };

      // Simular llamada API
      setTimeout(() => {
        this.isLoading = false;
        console.log('Usuario creado exitosamente');
        this.closeModal();
        alert('Usuario creado exitosamente');
      }, 2000);

    } else {
      alert('Por favor complete todos los campos requeridos');
    }
  }

  getRoleId(roleName: string): Observable<number> {
    return this.roleService.getAllRoles().pipe(
      map(roles => {
        const role = roles.find((r: any) => r.name === roleName);
        return role ? role.id : 1;
      }
    ));
  }

  editUser(userData: any) {
    this.isEditing = true;

    this.userForm.patchValue({
      username: userData.username,
      email: userData.email
    });

    this.selectedRoles = [...userData.roles];

    const employee = this.employees.find(emp =>
      emp.firstName + ' ' + emp.lastName === userData.employeeName
    );

    if (employee) {
      this.selectedEmployee = employee;
      this.employeeSearchControl.setValue(`${employee.firstName} ${employee.lastName}`);
    }

    this.openCreateModal();
  }
}
