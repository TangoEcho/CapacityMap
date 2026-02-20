import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { KBSettings } from '../types';
import { settingsApi } from '../services/api-adapter';

interface SettingsContextValue {
  settings: KBSettings | null;
  refresh: () => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: null,
  refresh: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<KBSettings | null>(null);

  const refresh = () => {
    settingsApi.get().then(setSettings).catch(() => {});
  };

  useEffect(() => { refresh(); }, []);

  return (
    <SettingsContext.Provider value={{ settings, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
