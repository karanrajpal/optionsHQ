"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function DarkModeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <Button variant={null} className="relative" onClick={() => {
            if (theme === 'dark') setTheme('light'); else setTheme('dark');
        }}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute left-4 h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span>Toggle theme</span>
        </Button>
    )
}
