'use client';
import Link from 'next/link';
import { LuRocket, LuMoon, LuSun } from 'react-icons/lu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from './ui/button';

import { useTheme } from 'next-themes';

export default function Header() {
    const { theme, setTheme } = useTheme();

    return (
        <header role="banner" className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="mx-auto py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 px-2">
                    <SidebarTrigger />
                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />
                    <Link href="/" aria-label="OptionsHQ home" className="font-semibold text-gray-900 dark:text-white no-underline">
                        <LuRocket className="inline-block mb-1 mr-1" size={20} />
                        OptionsHQ
                    </Link>
                </div>

                <nav aria-label="Primary navigation" className="flex items-center gap-4 pr-8">
                    {/* Account dropdown removed */}

                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    >
                        <LuSun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <LuMoon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </nav>
            </div>
        </header>
    );
}
