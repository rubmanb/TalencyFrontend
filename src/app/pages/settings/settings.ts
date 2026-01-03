import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type NotificationEventKey = 'employeeLifecycle' | 'vacations' | 'security';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css'],
})
export class Settings implements OnInit {
  activeTab: string = 'general';
  isLoading = false;
  hasUnsavedChanges = false;
  showApiKey = false;

  // ───────────────
  // GENERAL
  // ───────────────
  general = {
    companyName: 'Talency HR',
    timezone: 'Europe/Madrid',
    language: 'es',
    dateFormat: 'dd/MM/yyyy',
    email: 'admin@empresa.com',
    taxId: 'B12345678',
    address: 'Calle Falsa 123, Madrid, España',
    phone: '+34 600 123 456',
    city: 'Madrid',
    country: 'España',
    suscriptionPlan: 'Pro', // Free, Pro, Enterprise
  };

  // ───────────────
  // SECURITY (SIMPLIFICADO)
  // ───────────────
  security = {
    twoFactorAuth: false,
  };

  // ───────────────
  // NOTIFICATIONS (HR CENTRIC)
  // ───────────────
  notifications: {
    events: Record<NotificationEventKey, boolean>;
    channels: {
      email: boolean;
      inApp: boolean;
    };
  } = {
    events: {
      employeeLifecycle: true,
      vacations: true,
      security: true,
    },
    channels: {
      email: true,
      inApp: true,
    },
  };

  notificationEventList: { key: NotificationEventKey; label: string }[] = [
    { key: 'employeeLifecycle', label: 'Altas y bajas de empleados' },
    { key: 'vacations', label: 'Vacaciones' },
    { key: 'security', label: 'Alertas de seguridad' },
  ];

  // ───────────────
  // BACKUP (READ ONLY INFO)
  // ───────────────
  backup = {
    policy: 'Backups diarios automáticos (retención 30 días)',
    lastBackup: '2024-10-03T23:00:00',
  };

  // ───────────────
  // API (INTEGRATIONS)
  // ───────────────
  api = {
    enabled: false,
    key: 'sk_live_xxxxxxxxxxxxxxxxx',
    rateLimit: 100,
    lastUsed: 'Nunca',
    scopes: {
      readEmployees: true,
      readAnalytics: true,
      writeEmployees: false,
    },
  };

  private originalState: any;

  ngOnInit() {
    this.originalState = JSON.parse(JSON.stringify(this));
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  onChange() {
    this.hasUnsavedChanges = true;
  }

  saveSettings() {
    this.isLoading = true;

    setTimeout(() => {
      console.log('Settings guardados:', {
        general: this.general,
        security: this.security,
        notifications: this.notifications,
        api: this.api,
      });

      this.originalState = JSON.parse(JSON.stringify(this));
      this.hasUnsavedChanges = false;
      this.isLoading = false;

      alert('Configuración guardada correctamente');
    }, 1000);
  }

  resetSettings() {
    if (!confirm('¿Restablecer cambios no guardados?')) return;

    Object.assign(this, JSON.parse(JSON.stringify(this.originalState)));
    this.hasUnsavedChanges = false;
  }

  generateApiKey() {
    if (!confirm('¿Generar una nueva API Key? La anterior dejará de funcionar.')) return;

    this.api.key =
      'sk_live_' +
      Math.random().toString(36).substring(2) +
      Math.random().toString(36).substring(2);

    this.hasUnsavedChanges = true;
  }
}
