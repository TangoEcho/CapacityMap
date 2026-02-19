import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Settings } from '../types';
import { settingsApi } from '../services/api-adapter';

interface SettingsContextValue {
  settings: Settings | null;
  hideCapacity: boolean;
  refresh: () => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: null,
  hideCapacity: false,
  refresh: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);

  const refresh = () => {
    settingsApi.get().then(setSettings).catch(() => {});
  };

  useEffect(() => { refresh(); }, []);

  return (
    <SettingsContext.Provider value={{
      settings,
      hideCapacity: settings?.hideCapacity ?? false,
      refresh,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
