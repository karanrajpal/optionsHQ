"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useModulePreferences } from "@/context/ModulePreferencesProvider";
import { LuChartBar } from "react-icons/lu";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function PortfolioTrackingTab() {
  const { preferences, isLoading, updatePreferences } = useModulePreferences();
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async (checked: boolean) => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      await updatePreferences({ portfolio_tracking_enabled: checked });
    } catch (error) {
      console.error("Error updating preferences:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const isEnabled = preferences?.portfolio_tracking_enabled ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <LuChartBar size={32} className="text-gray-700 dark:text-gray-300" />
        <div>
          <h2 className="text-2xl font-bold">Portfolio Tracking</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your portfolio tracking preferences including stocks, options, and performance monitoring.
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

          {/* Add Broker Section */}
          <div className="border-t pt-6">
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold">Broker Connection</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connect your brokerage account to track your portfolio
                </p>
              </div>
              <Button asChild>
                <Link href="/add-broker">Add Broker</Link>
              </Button>
            </div>
          </div>

          {/* Placeholder for future settings */}
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Additional settings for portfolio tracking will be available here in the future.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
