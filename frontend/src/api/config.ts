export const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '') || '');

export const DEFAULT_MODEL = import.meta.env.VITE_DEFAULT_MODEL || 'openrouter/free';
