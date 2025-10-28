"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { LuChartBar, LuSearch, LuList, LuActivity } from "react-icons/lu";
import { Skeleton } from "@/components/ui/skeleton";
import { useModulePreferences } from "@/context/ModulePreferencesProvider";
import { PortfolioTrackingTab } from "@/components/setup/PortfolioTrackingTab";
import { OptionsDiscoveryTab } from "@/components/setup/OptionsDiscoveryTab";
import { WatchlistTab } from "@/components/setup/WatchlistTab";
import { KalshiMonitoringTab } from "@/components/setup/KalshiMonitoringTab";

type ModuleTab = 'portfolio' | 'discovery' | 'watchlist' | 'kalshi';

const moduleConfig = {
  portfolio: {
    title: "Portfolio Tracking",
    icon: LuChartBar,
    component: PortfolioTrackingTab,
  },
  discovery: {
    title: "Options Discovery",
    icon: LuSearch,
    component: OptionsDiscoveryTab,
  },
  watchlist: {
    title: "Watchlist",
    icon: LuList,
    component: WatchlistTab,
  },
  kalshi: {
    title: "Kalshi Monitoring",
    icon: LuActivity,
    component: KalshiMonitoringTab,
  },
};

export default function SetupPage() {
  const [activeTab, setActiveTab] = useState<ModuleTab>('portfolio');
  const { isLoading } = useModulePreferences();

  const ActiveComponent = moduleConfig[activeTab].component;

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
            <ActiveComponent key={activeTab} />
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}
