import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { PWAWrapper } from "@/components/pwa-wrapper";
import Script from "next/script";
import Header from "@/components/header";
import { SnaptradeAccountsProvider } from "@/context/SnaptradeAccountsProvider";
import { ReactNode, Suspense } from "react";
import { UserDataAccountsProvider } from "@/context/UserDataAccountsProvider";
import { WatchlistProvider } from "@/context/WatchlistProvider";
import { ModulePreferencesProvider } from "@/context/ModulePreferencesProvider";
import { LuRocket } from "react-icons/lu";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

// const inter = Inter({ subsets: ["latin"] });

/**
 * Exporting this metadata object is enough for Next.JS to pick it up for the page and SEO.
 */
export const metadata: Metadata = {
    title: "OptionsHQ",
    description: "An app to view your options trading data",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="en">
            <Script async src="https://analytics.karanrajpal.net/script.js" data-website-id="36e23ca2-95a7-49fe-986a-5fbce6bc4b76"></Script>
            <body className="font-sans">
                <StackProvider app={stackClientApp}>
                    <StackTheme>
                        <PWAWrapper>
                            <ThemeProvider
                                attribute="class"
                                defaultTheme="system"
                                enableSystem
                                disableTransitionOnChange
                            >
                                <Suspense fallback={<div className="flex items-center justify-center h-screen">
                                    <LuRocket className="animate-bounce text-4xl" />
                                </div>}>
                                    <UserDataAccountsProvider>
                                        <ModulePreferencesProvider>
                                            <SnaptradeAccountsProvider>
                                                <WatchlistProvider>
                                                    <SidebarProvider>
                                                        <AppSidebar />
                                                        <main className="w-full">
                                                            <div className="flex items-center gap-2 p-2 border-b">
                                                                <SidebarTrigger />
                                                            </div>
                                                            {stackClientApp.getUser().then(user => user && <Header />)}
                                                            {children}
                                                        </main>
                                                    </SidebarProvider>
                                                </WatchlistProvider>
                                            </SnaptradeAccountsProvider>
                                        </ModulePreferencesProvider>
                                    </UserDataAccountsProvider>
                                </Suspense>
                            </ThemeProvider>
                        </PWAWrapper>
                    </StackTheme>
                </StackProvider>
            </body>
        </html>
    );
}
