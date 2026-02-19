export const { banksApi, projectsApi, settingsApi, countriesApi, uploadApi } =
  import.meta.env.VITE_STORAGE === 'local'
    ? await import('./api.local')
    : await import('./api');
