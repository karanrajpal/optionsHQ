"use client";

import { useUser } from "@stackframe/stack";
import { useModulePreferences } from "@/context/ModulePreferencesProvider";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem 
} from "@/components/ui/sidebar";
import { LuUser, LuBarChart3, LuSearch, LuList, LuActivity } from "react-icons/lu";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const user = useUser();
  const { preferences, isLoading, updatePreferences } = useModulePreferences();
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async (key: keyof typeof preferences) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Sidebar>
      <SidebarContent>
        {/* Account Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center gap-2">
                <LuUser className="text-gray-600 dark:text-gray-400" size={18} />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Welcome, {user?.displayName ?? 'Options Lover'}
                  </p>
                  {user?.primaryEmail && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.primaryEmail}
                    </p>
                  )}
                </div>
              </div>
              {user?.createdAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Member since {formatDate(user.createdAt.toISOString())}
                </p>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Module Preferences Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Module Preferences</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <>
                  <Skeleton className="h-10 w-full mb-2" />
                  <Skeleton className="h-10 w-full mb-2" />
                  <Skeleton className="h-10 w-full mb-2" />
                  <Skeleton className="h-10 w-full" />
                </>
              ) : preferences ? (
                <>
                  <SidebarMenuItem>
                    <div className="flex items-center justify-between w-full px-2 py-2">
                      <div className="flex items-center gap-2">
                        <LuBarChart3 size={18} />
                        <span className="text-sm">Portfolio Tracking</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle('portfolio_tracking_enabled')}
                        disabled={isSaving}
                        className={`h-6 w-12 rounded-full p-0 transition-colors ${
                          preferences.portfolio_tracking_enabled
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                        }`}
                      >
                        <span
                          className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                            preferences.portfolio_tracking_enabled ? 'translate-x-3' : 'translate-x-1'
                          }`}
                        />
                      </Button>
                    </div>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <div className="flex items-center justify-between w-full px-2 py-2">
                      <div className="flex items-center gap-2">
                        <LuSearch size={18} />
                        <span className="text-sm">Options Discovery</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle('options_discovery_enabled')}
                        disabled={isSaving}
                        className={`h-6 w-12 rounded-full p-0 transition-colors ${
                          preferences.options_discovery_enabled
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                        }`}
                      >
                        <span
                          className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                            preferences.options_discovery_enabled ? 'translate-x-3' : 'translate-x-1'
                          }`}
                        />
                      </Button>
                    </div>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <div className="flex items-center justify-between w-full px-2 py-2">
                      <div className="flex items-center gap-2">
                        <LuList size={18} />
                        <span className="text-sm">Watchlist</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle('watchlist_enabled')}
                        disabled={isSaving}
                        className={`h-6 w-12 rounded-full p-0 transition-colors ${
                          preferences.watchlist_enabled
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                        }`}
                      >
                        <span
                          className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                            preferences.watchlist_enabled ? 'translate-x-3' : 'translate-x-1'
                          }`}
                        />
                      </Button>
                    </div>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <div className="flex items-center justify-between w-full px-2 py-2">
                      <div className="flex items-center gap-2">
                        <LuActivity size={18} />
                        <span className="text-sm">Kalshi Monitoring</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle('kalshi_monitoring_enabled')}
                        disabled={isSaving}
                        className={`h-6 w-12 rounded-full p-0 transition-colors ${
                          preferences.kalshi_monitoring_enabled
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                        }`}
                      >
                        <span
                          className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                            preferences.kalshi_monitoring_enabled ? 'translate-x-3' : 'translate-x-1'
                          }`}
                        />
                      </Button>
                    </div>
                  </SidebarMenuItem>
                </>
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
