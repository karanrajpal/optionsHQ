"use client";

import { useUser } from "@stackframe/stack";
import { useModulePreferences } from "@/context/ModulePreferencesProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  SidebarMenuSkeleton,
  useSidebar
} from "@/components/ui/sidebar";
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
  LuLogOut
} from "react-icons/lu";
import { MdOutlineBarChart, MdOutlineHome, MdOutlineStackedLineChart } from "react-icons/md";

export function AppSidebar() {
  const user = useUser();
  const { preferences, isLoading } = useModulePreferences();
  const pathname = usePathname();
  const { state, setOpen } = useSidebar();
  const collapsed = state === "collapsed";

  // Only show sidebar if user is logged in
  if (!user) {
    return null;
  }

  // Show loading skeleton
  if (isLoading) {
    return (
      <Sidebar collapsible="icon">
        <SidebarContent className="mt-10">
          <SidebarMenu>
            <SidebarMenuSkeleton showIcon />
            <SidebarMenuSkeleton showIcon />
            <SidebarMenuSkeleton showIcon />
            <SidebarMenuSkeleton showIcon />
            <SidebarMenuSkeleton showIcon />
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    );
  }

  const hasStocksGroup = preferences?.portfolio_tracking_enabled || preferences?.watchlist_enabled;
  const hasOptionsGroup = preferences?.portfolio_tracking_enabled || preferences?.options_discovery_enabled;


  return (
    <Sidebar collapsible="icon" className="z-[51]">
      <SidebarContent className="gap-0">
        {/* Home */}
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem className={`flex justify-center ${collapsed ? 'mt-2 mb-2' : ''}`}>
                <SidebarMenuButton asChild size='lg' isActive={pathname === "/"} tooltip="Home" onClick={() => setOpen(false)}>
                  <Link href="/">
                    <MdOutlineHome className="!w-8 !h-8" />
                    {!collapsed && <span className="text-base">Home</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Stocks Section */}
        {hasStocksGroup && (
          <SidebarGroup>
            <SidebarGroupLabel>Stocks</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {preferences?.watchlist_enabled && (
                  <SidebarMenuItem className={`flex justify-center ${collapsed ? 'mt-2 mb-2' : ''}`}>
                    <SidebarMenuButton asChild size="lg" isActive={pathname === "/watchlist"} tooltip="Watchlist" onClick={() => setOpen(false)}>
                      <Link href="/watchlist">
                        <LuList className="!w-8 !h-8" />
                        {!collapsed && <span className="text-base">Watchlist</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {preferences?.portfolio_tracking_enabled && (
                  <SidebarMenuItem className={`flex justify-center ${collapsed ? 'mt-2 mb-2' : ''}`}>
                    <SidebarMenuButton asChild size="lg" isActive={pathname === "/holdings"} tooltip="Stocks" onClick={() => setOpen(false)}>
                      <Link href="/holdings">
                        <MdOutlineBarChart className="!w-8 !h-8" />
                        {!collapsed && <span className="text-base">Stocks</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Options Section */}
        {hasOptionsGroup && (
          <SidebarGroup>
            <SidebarGroupLabel>Options</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {preferences?.portfolio_tracking_enabled && (
                  <>
                    <SidebarMenuItem className={`flex justify-center ${collapsed ? 'mt-2 mb-2' : ''}`}>
                      <SidebarMenuButton asChild size="lg" isActive={pathname === "/options"} tooltip="Options" onClick={() => setOpen(false)}>
                        <Link href="/options">
                          <LuTrendingUp className={"!w-8 !h-8"} />
                          {!collapsed && <span className="text-base">Options</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem className={`flex justify-center ${collapsed ? 'mt-2 mb-2' : ''}`}>
                      <SidebarMenuButton asChild size="lg" isActive={pathname === "/options-performance"} tooltip="Options Performance" onClick={() => setOpen(false)}>
                        <Link href="/options-performance">
                          <MdOutlineStackedLineChart className="!w-8 !h-8" />
                          {!collapsed && <span className="text-base">Options Performance</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
                {preferences?.options_discovery_enabled && (
                  <SidebarMenuItem className={`flex justify-center ${collapsed ? 'mt-2 mb-2' : ''}`}>
                    <SidebarMenuButton asChild size="lg" isActive={pathname === "/discover"} tooltip="Discover" onClick={() => setOpen(false)}>
                      <Link href="/discover">
                        <LuSearch className="!w-8 !h-8" />
                        {!collapsed && <span className="text-base">Discover</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem className={`flex justify-center ${collapsed ? 'mt-2 mb-2' : ''}`}>
                <SidebarMenuButton asChild size="lg" isActive={pathname === "/setup"} tooltip="Setup" onClick={() => setOpen(false)}>
                  <Link href="/setup">
                    <LuSettings className="!w-8 !h-8" />
                    {!collapsed && <span className="text-base">Setup</span>}
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
          <SidebarMenuItem className={`flex justify-center items-center ${collapsed ? 'mt-2 mb-2' : ''}`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="w-full">
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
                      {user.displayName?.[0]?.toUpperCase() || (user.primaryEmail?.[0] ? user.primaryEmail[0].toUpperCase() : "U")}
                    </div>
                    {!collapsed && (
                      <div className="flex flex-col items-start flex-1 min-w-0">
                        <span className="text-sm font-medium truncate w-full">
                          {user.displayName || "User"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate w-full">
                          {user.primaryEmail}
                        </span>
                      </div>
                    )}
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" className="w-56 z-[52]">
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
