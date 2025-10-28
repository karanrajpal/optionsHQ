"use client";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useUser } from "@stackframe/stack";

export interface ModulePreferences {
  portfolio_tracking_enabled: boolean;
  options_discovery_enabled: boolean;
  watchlist_enabled: boolean;
  kalshi_monitoring_enabled: boolean;
}

type ModulePreferencesContextType = {
  preferences: ModulePreferences | null;
  isLoading: boolean;
  updatePreferences: (preferences: Partial<ModulePreferences>) => Promise<void>;
  refreshPreferences: () => Promise<void>;
};

const ModulePreferencesContext = createContext<ModulePreferencesContextType | undefined>(undefined);

const DEFAULT_PREFERENCES: ModulePreferences = {
  portfolio_tracking_enabled: true,
  options_discovery_enabled: true,
  watchlist_enabled: true,
  kalshi_monitoring_enabled: false,
};

export const ModulePreferencesProvider = ({ children }: { children: ReactNode }) => {
  const user = useUser();
  const [preferences, setPreferences] = useState<ModulePreferences | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPreferences = useCallback(async () => {
    if (!user?.id) {
      setPreferences(DEFAULT_PREFERENCES);
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`/api/module-preferences?user_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      } else if (response.status === 404) {
        // No preferences found, use defaults
        setPreferences(DEFAULT_PREFERENCES);
      } else {
        console.error("Error fetching module preferences:", response.statusText);
        setPreferences(DEFAULT_PREFERENCES);
      }
    } catch (error) {
      console.error("Error fetching module preferences:", error);
      setPreferences(DEFAULT_PREFERENCES);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchPreferences();
    } else {
      setPreferences(DEFAULT_PREFERENCES);
      setIsLoading(false);
    }
  }, [user?.id, fetchPreferences]);

  const updatePreferences = useCallback(async (newPreferences: Partial<ModulePreferences>) => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/module-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...newPreferences }),
      });
      
      if (response.ok) {
        await fetchPreferences();
      } else {
        console.error("Error updating module preferences:", response.statusText);
        throw new Error("Failed to update preferences");
      }
    } catch (error) {
      console.error("Error updating module preferences:", error);
      throw error;
    }
  }, [user?.id, fetchPreferences]);

  const value = useMemo(
    () => ({
      preferences,
      isLoading,
      updatePreferences,
      refreshPreferences: fetchPreferences,
    }),
    [preferences, isLoading, updatePreferences, fetchPreferences]
  );

  return <ModulePreferencesContext.Provider value={value}>{children}</ModulePreferencesContext.Provider>;
};

export const useModulePreferences = () => {
  const ctx = useContext(ModulePreferencesContext);
  if (!ctx) {
    throw new Error("useModulePreferences must be used within a ModulePreferencesProvider");
  }
  return ctx;
};
