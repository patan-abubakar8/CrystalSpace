export const APP_CONFIG = {
  APP_NAME: 'CrystalSpace',
  APP_VERSION: '1.0.0',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  AUTH_TOKEN_KEY: 'crystalspace_auth_token',
  USER_DATA_KEY: 'crystalspace_user_data',
  THEME_KEY: 'crystalspace_theme',
};
