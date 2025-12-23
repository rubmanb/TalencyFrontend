import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Employee } from './../../interfaces/employee.interface';
import { RoleService } from '../../core/services/role.service';
import { Role } from '../../interfaces/role.interface';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-user.html',
  styleUrls: ['./create-user.css']
})
export class CreateUser implements OnInit {

  // ⬇ Empleados permitidos enviados desde Users
  @Input() employeesCanBeUsers: Employee[] = [];

  // ⬇ Evento que se envía al padre
  @Output() saveUser = new EventEmitter<any>();

  userForm: FormGroup;
  employeeSearchControl = new FormControl();
  filteredEmployees: Employee[] = [];

  selectedEmployee: Employee | null = null;
  roles: Role[] = [];
  selectedRoles: Role[] = [];
  rolesFiltered: Role[] = [];
  selectedRoleIds: number[] = [];

  isEditing: boolean = false;
  isModalOpen: boolean = false;

  constructor(private fb: FormBuilder, private roleService: RoleService) {
    this.userForm = this.createForm();
  }

  ngOnInit() {
    this.roleService.getAllRoles().subscribe(data => {
    this.roles = data;
    this.rolesFiltered = this.roles.filter(r => r.name !== 'ROLE_SUPER_ADMIN');
    });
    this.employeeSearchControl.valueChanges.subscribe(value => {
    this.onEmployeeSearch(value);
    });
  }

  openCreateModal() {
    this.isModalOpen = true;
    this.resetForm();
    this.filteredEmployees = [...this.employeesCanBeUsers]
  }

  closeModal() {
    this.isModalOpen = false;
    this.resetForm();
  }

  private resetForm() {
    this.userForm.reset();
    this.employeeSearchControl.setValue('');
    this.selectedEmployee = null;
    this.selectedRoles = [];
    this.filteredEmployees = [];
    this.isEditing = false;
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
      this.filteredEmployees = this.employeesCanBeUsers.filter(employee =>
        employee.firstName.toLowerCase().includes(value.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(value.toLowerCase()) ||
        employee.dni.includes(value) ||
        employee.position.toLowerCase().includes(value.toLowerCase())
      );
    } else {
      this.filteredEmployees = [];
    }
  }

  onEmployeeSelected(employee: Employee) {
    console.log('Empleado seleccionado:', employee);
    this.selectedEmployee = employee;
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

    return `${firstPart}.${lastPart}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  onRoleChange(event: any, role: any) {
    const checked = event.target.checked;

    if (checked) {
      this.selectedRoleIds.push(role.id);
    } else {
      this.selectedRoleIds = this.selectedRoleIds.filter(id => id !== role.id);
    }

    this.selectedRoles = this.rolesFiltered.filter(r =>
      this.selectedRoleIds.includes(r.id)
    );
    console.log(this.selectedRoles)
  }

  onSubmit() {
    if (this.userForm.valid && this.selectedEmployee && this.roles.length > 0) {
      console.log(this.roles)
      const dto = {
        employeeId: this.selectedEmployee.id,
        username: this.userForm.value.username,
        email: this.userForm.value.email,
        password: this.userForm.value.password,
        roleIds: this.selectedRoleIds
      };
      console.log(dto)
      this.saveUser.emit(dto);
      this.closeModal();

    } else {
      console.error('Formulario inválido o empleado/roles no seleccionados');
      alert('Por favor complete todos los campos requeridos');
    }
  }

  editUser(userData: any) {
    this.isEditing = true;

    this.userForm.patchValue({
      username: userData.username,
      email: userData.email
    });

    this.selectedRoles = [...userData.roles];

    const employee = this.employeesCanBeUsers.find(
      emp => emp.firstName + ' ' + emp.lastName === userData.employeeName
    );

    if (employee) {
      this.selectedEmployee = employee;
      this.employeeSearchControl.setValue(`${employee.firstName} ${employee.lastName}`);
    }

    this.openCreateModal();
  }
}
