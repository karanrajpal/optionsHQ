"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModulePreferences, ModulePreferences } from "@/context/ModulePreferencesProvider";
import { LuChartBar, LuSearch, LuList, LuActivity } from "react-icons/lu";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

type ModuleTab = 'portfolio' | 'discovery' | 'watchlist' | 'kalshi';

const moduleConfig = {
  portfolio: {
    title: "Portfolio Tracking",
    icon: LuChartBar,
    description: "Manage your portfolio tracking preferences including stocks, options, and performance monitoring.",
    prefKey: 'portfolio_tracking_enabled' as keyof ModulePreferences,
  },
  discovery: {
    title: "Options Discovery",
    icon: LuSearch,
    description: "Configure options discovery tools to search and analyze options by ticker symbol.",
    prefKey: 'options_discovery_enabled' as keyof ModulePreferences,
  },
  watchlist: {
    title: "Watchlist",
    icon: LuList,
    description: "Set up your watchlist preferences to track your favorite tickers.",
    prefKey: 'watchlist_enabled' as keyof ModulePreferences,
  },
  kalshi: {
    title: "Kalshi Monitoring",
    icon: LuActivity,
    description: "Configure Kalshi volume and trade tracking (coming soon).",
    prefKey: 'kalshi_monitoring_enabled' as keyof ModulePreferences,
  },
};

export default function SetupPage() {
  const [activeTab, setActiveTab] = useState<ModuleTab>('portfolio');
  const { preferences, isLoading, updatePreferences } = useModulePreferences();
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async (key: keyof ModulePreferences) => {
    if (!preferences || isSaving) return;
    
    setIsSaving(true);
    try {
      await updatePreferences({ [key]: !preferences[key] });
    } catch (error) {
      console.error("Error updating preferences:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const TabContent = ({ tab }: { tab: ModuleTab }) => {
    const config = moduleConfig[tab];
    const Icon = config.icon;
    const isEnabled = preferences?.[config.prefKey];

    return (
      <motion.div
        key={tab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <Icon size={32} className="text-gray-700 dark:text-gray-300" />
          <div>
            <h2 className="text-2xl font-bold">{config.title}</h2>
            <p className="text-gray-600 dark:text-gray-400">{config.description}</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Enable Module</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Turn this module on or off
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggle(config.prefKey)}
                disabled={isSaving || isLoading}
                className={`h-8 w-16 rounded-full p-0 transition-colors ${
                  isEnabled
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
              >
                <span
                  className={`block h-6 w-6 rounded-full bg-white transition-transform ${
                    isEnabled ? 'translate-x-4' : 'translate-x-1'
                  }`}
                />
              </Button>
            </div>

            {/* Placeholder for future settings */}
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Additional settings for this module will be available here in the future.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <main className="flex min-h-screen">
      {/* Sidebar with tabs */}
      <aside className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
        <h1 className="text-xl font-bold mb-6 px-2">Module Settings</h1>
        <nav className="space-y-1">
          {(Object.keys(moduleConfig) as ModuleTab[]).map((tab) => {
            const config = moduleConfig[tab];
            const Icon = config.icon;
            const isActive = activeTab === tab;
            
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{config.title}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Content area */}
      <div className="flex-1 p-8">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <TabContent tab={activeTab} />
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}
