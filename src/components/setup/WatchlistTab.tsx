"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useModulePreferences } from "@/context/ModulePreferencesProvider";
import { LuList } from "react-icons/lu";
import { Switch } from "@/components/ui/switch";

export function WatchlistTab() {
  const { preferences, isLoading, updatePreferences } = useModulePreferences();
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async (checked: boolean) => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      await updatePreferences({ watchlist_enabled: checked });
    } catch (error) {
      console.error("Error updating preferences:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const isEnabled = preferences?.watchlist_enabled ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <LuList size={32} className="text-gray-700 dark:text-gray-300" />
        <div>
          <h2 className="text-2xl font-bold">Watchlist</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Set up your watchlist preferences to track your favorite tickers.
          </p>
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="space-y-6">
          {/* Enable Module Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Enable Module</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Turn this module on or off
              </p>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggle}
              disabled={isSaving || isLoading}
            />
          </div>

          {/* Placeholder for future settings */}
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Additional settings for watchlist will be available here in the future.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
