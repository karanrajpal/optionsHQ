'use client';
import React from 'react';
import Link from 'next/link';
import { LuSettings } from 'react-icons/lu';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from './ui/navigation-menu';
import { DarkModeToggle } from './dark-mode-toggle';
import { Button } from './ui/button';
import { useAuth } from '@/context/AuthProvider';

export default function Header() {
    return (
        <header role="banner" className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                <Link href="/" aria-label="OptionsHQ home" className="font-semibold text-gray-900 dark:text-white no-underline">
                    OptionsHQ
                </Link>

                <nav aria-label="Primary navigation" className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white no-underline">
                        Dashboard
                    </Link>
                    <Link href="/positions" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white no-underline">
                        Positions
                    </Link>
                    <Link href="/options-dashboard" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white no-underline">
                        Options
                    </Link>

                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger className="text-gray-600 hover:text-gray-900 bg-inherit dark:text-gray-300 dark:hover:text-white">
                                    <LuSettings size={18} />
                                </NavigationMenuTrigger>
                                <NavigationMenuContent className="w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm left-auto right-0 origin-top-right">
                                    <NavigationMenuLink className="block px-4 py-2 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">
                                        <div className="flex items-center gap-2">
                                            <DarkModeToggle />
                                        </div>
                                    </NavigationMenuLink>
                                    <NavigationMenuLink className="block px-4 py-2 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">
                                        <AuthMenuButton />
                                    </NavigationMenuLink>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </nav>
            </div>
        </header>
    );
}

function AuthMenuButton() {
    const { isLoggedIn, logout } = useAuth();

    return (
        <Button variant={null} className="w-full text-left no-underline" onClick={() => { if (isLoggedIn) logout(); else window.location.assign('/'); }}>
            {isLoggedIn ? 'Logout' : 'Login'}
        </Button>
    );
}
