"use client";

import { useUser } from "@stackframe/stack";
import { useModulePreferences } from "@/context/ModulePreferencesProvider";
import Link from "next/link";
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
import { 
  LuHome, 
  LuBarChart2, 
  LuTrendingUp, 
  LuLineChart, 
  LuList, 
  LuSearch, 
  LuSettings 
} from "react-icons/lu";

export function AppSidebar() {
  const user = useUser();
  const { preferences } = useModulePreferences();

  // Only show sidebar if user is logged in
  if (!user) {
    return null;
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/">
                    <LuHome />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {preferences?.portfolio_tracking_enabled && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/holdings">
                        <LuBarChart2 />
                        <span>Stocks</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/options">
                        <LuTrendingUp />
                        <span>Options</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/options-performance">
                        <LuLineChart />
                        <span>Options Performance</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}

              {preferences?.watchlist_enabled && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/watchlist">
                      <LuList />
                      <span>Watchlist</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {preferences?.options_discovery_enabled && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/discover">
                      <LuSearch />
                      <span>Discover</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/setup">
                    <LuSettings />
                    <span>Setup</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
