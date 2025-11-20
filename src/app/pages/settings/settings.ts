import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class Settings implements OnInit {
  activeTab: string = 'general';
  
  settings: GeneralSettings = {
    companyName: 'Talency HR',
    timezone: 'Europe/Madrid',
    language: 'es',
    dateFormat: 'dd/MM/yyyy',
    autoLogout: true,
    maintenanceMode: false
  };

  security: SecuritySettings = {
    minPasswordLength: 8,
    passwordExpiryDays: 90,
    requireSpecialChars: true,
    requireNumbers: true,
    twoFactorAuth: false,
    loginAttemptsLimit: true
  };

  notifications: NotificationSettings = {
    email: {
      newEmployee: true,
      employeeTermination: true,
      vacationRequests: true
    },
    system: {
      updates: true,
      securityAlerts: true
    }
  };

  backup: BackupSettings = {
    frequency: 'weekly',
    maxBackups: 10,
    lastBackup: '2024-10-03T23:00:00'
  };

  api: ApiSettings = {
    enabled: true,
    key: 'sk_live_abc123def456ghi789',
    rateLimit: 100
  };

  showApiKey: boolean = false;
  hasUnsavedChanges: boolean = false;

  // Almacenar valores originales para reset
  private originalSettings: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadSettings();
    // Guardar valores originales
    this.originalSettings = {
      settings: { ...this.settings },
      security: { ...this.security },
      notifications: { ...this.notifications },
      backup: { ...this.backup },
      api: { ...this.api }
    };
  }

  loadSettings() {
    // Simular carga de configuración - reemplazar con API real
    console.log('Cargando configuración del sistema...');
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  onSettingChange() {
    this.hasUnsavedChanges = true;
  }

  saveSettings() {
    this.isLoading = true;
    
    // Simular guardado - reemplazar con API real
    setTimeout(() => {
      console.log('Guardando configuración:', {
        general: this.settings,
        security: this.security,
        notifications: this.notifications,
        backup: this.backup,
        api: this.api
      });
      
      this.originalSettings = {
        settings: { ...this.settings },
        security: { ...this.security },
        notifications: { ...this.notifications },
        backup: { ...this.backup },
        api: { ...this.api }
      };
      
      this.hasUnsavedChanges = false;
      this.isLoading = false;
      alert('Configuración guardada exitosamente');
    }, 1000);
  }

  resetSettings() {
    if (confirm('¿Estás seguro de que quieres restablecer todos los cambios?')) {
      this.settings = { ...this.originalSettings.settings };
      this.security = { ...this.originalSettings.security };
      this.notifications = { ...this.originalSettings.notifications };
      this.backup = { ...this.originalSettings.backup };
      this.api = { ...this.originalSettings.api };
      this.hasUnsavedChanges = false;
    }
  }

  createBackup() {
    if (confirm('¿Crear backup del sistema ahora?')) {
      this.isLoading = true;
      
      setTimeout(() => {
        this.backup.lastBackup = new Date().toISOString();
        this.isLoading = false;
        alert('Backup creado exitosamente');
      }, 2000);
    }
  }

  restoreBackup() {
    alert('Funcionalidad de restauración de backup - Por implementar');
  }

  generateApiKey() {
    if (confirm('¿Generar nueva API Key? La clave actual dejará de funcionar.')) {
      const newKey = 'sk_live_' + Math.random().toString(36).substr(2, 16) + Math.random().toString(36).substr(2, 16);
      this.api.key = newKey;
      this.hasUnsavedChanges = true;
      alert('Nueva API Key generada');
    }
  }

  // Helper para mostrar loading states
  isLoading: boolean = false;
}