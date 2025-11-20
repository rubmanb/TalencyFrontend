import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'navbar-component',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  username: string = 'Usuario';
  company_name: string = 'Company Inc.';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUsername();
  }

  private loadUsername() {
    this.username = this.authService.getUsername();
  }

  private loadCompanyName() {
    this.company_name = this.authService.getCompanyName() || 'Company Inc.';
  }

  logout() {
    this.authService.logout();
  }
}
