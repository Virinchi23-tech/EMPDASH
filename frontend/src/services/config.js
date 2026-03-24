const defaultConfig = {
  organizationName: 'EMP Logic Research',
  standardWorkingHours: '09:00 AM - 06:00 PM',
  systemTimezone: 'UTC+5:30',
  adminNotificationsEmail: 'admin@company.com',
  multiFactorAuth: true,
  autoApproveLeaves: false,
  allowOvertimeLogging: true,
};

const getStoredConfig = () => {
  const stored = localStorage.getItem('emp_config');
  return stored ? JSON.parse(stored) : defaultConfig;
};

const saveConfig = (config) => {
  localStorage.setItem('emp_config', JSON.stringify(config));
};

let currentConfig = getStoredConfig();

export const getConfig = async () => currentConfig;

export const updateConfig = async (newConfig) => {
  currentConfig = { ...currentConfig, ...newConfig };
  saveConfig(currentConfig);
  return { success: true, config: currentConfig };
};

export const resetConfig = async () => {
  currentConfig = { ...defaultConfig };
  saveConfig(currentConfig);
  return { success: true, config: currentConfig };
};
