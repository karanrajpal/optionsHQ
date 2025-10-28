"use client";

import { useUser } from "@stackframe/stack";
import { useModulePreferences } from "@/context/ModulePreferencesProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter,
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarMenuSkeleton
} from "@/components/ui/sidebar";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LuTrendingUp, 
  LuList, 
  LuSearch, 
  LuSettings,
  LuChevronDown,
  LuLogOut
} from "react-icons/lu";
import { MdOutlineBarChart, MdOutlineHome, MdOutlineStackedLineChart } from "react-icons/md";

export function AppSidebar() {
  const user = useUser();
  const { preferences, isLoading } = useModulePreferences();
  const pathname = usePathname();
  const [stocksOpen, setStocksOpen] = useState(true);
  const [optionsOpen, setOptionsOpen] = useState(true);

  // Only show sidebar if user is logged in
  if (!user) {
    return null;
  }

  // Show loading skeleton
  if (isLoading) {
    return (
      <Sidebar collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Loading...</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }

  const hasStocksGroup = preferences?.portfolio_tracking_enabled || preferences?.watchlist_enabled;
  const hasOptionsGroup = preferences?.portfolio_tracking_enabled || preferences?.options_discovery_enabled;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Home */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="lg" isActive={pathname === "/"}>
                  <Link href="/">
                    <MdOutlineHome className="!w-5 !h-5" />
                    <span className="text-base">Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Stocks Group */}
        {hasStocksGroup && (
          <Collapsible open={stocksOpen} onOpenChange={setStocksOpen} className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-semibold">
                  Stocks
                  <LuChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {preferences?.watchlist_enabled && (
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild size="lg" isActive={pathname === "/watchlist"}>
                          <Link href="/watchlist">
                            <LuList className="!w-5 !h-5" />
                            <span className="text-base">Watchlist</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                    {preferences?.portfolio_tracking_enabled && (
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild size="lg" isActive={pathname === "/holdings"}>
                          <Link href="/holdings">
                            <MdOutlineBarChart className="!w-5 !h-5" />
                            <span className="text-base">Stocks</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}

        {/* Options Group */}
        {hasOptionsGroup && (
          <Collapsible open={optionsOpen} onOpenChange={setOptionsOpen} className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-semibold">
                  Options
                  <LuChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {preferences?.portfolio_tracking_enabled && (
                      <>
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild size="lg" isActive={pathname === "/options"}>
                            <Link href="/options">
                              <LuTrendingUp className="!w-5 !h-5" />
                              <span className="text-base">Options</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild size="lg" isActive={pathname === "/options-performance"}>
                            <Link href="/options-performance">
                              <MdOutlineStackedLineChart className="!w-5 !h-5" />
                              <span className="text-base">Options Performance</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </>
                    )}
                    {preferences?.options_discovery_enabled && (
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild size="lg" isActive={pathname === "/discover"}>
                          <Link href="/discover">
                            <LuSearch className="!w-5 !h-5" />
                            <span className="text-base">Discover</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="lg" isActive={pathname === "/setup"}>
                  <Link href="/setup">
                    <LuSettings className="!w-5 !h-5" />
                    <span className="text-base">Setup</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Profile Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="w-full">
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
                      {user.displayName?.[0]?.toUpperCase() || user.primaryEmail?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <span className="text-sm font-medium truncate w-full">
                        {user.displayName || "User"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate w-full">
                        {user.primaryEmail}
                      </span>
                    </div>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" className="w-56">
                <DropdownMenuItem onClick={() => user.signOut()} className="cursor-pointer">
                  <LuLogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
