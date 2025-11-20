interface NotificationSettings {
  email: {
    newEmployee: boolean;
    employeeTermination: boolean;
    vacationRequests: boolean;
  };
  system: {
    updates: boolean;
    securityAlerts: boolean;
  };
}

