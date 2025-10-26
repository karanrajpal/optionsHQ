import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { PWAWrapper } from "@/components/pwa-wrapper";
import Script from "next/script";
import Header from "@/components/header";
import { SnaptradeAuthProvider } from "@/context/SnaptradeAuthProvider";
import { SnaptradeAccountProvider } from "@/context/SnaptradeAccountProvider";
import { ReactNode } from "react";

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
                                <SnaptradeAuthProvider>
                                    <SnaptradeAccountProvider>
                                        {stackClientApp.getUser().then(user => user && <Header />)}
                                        {children}
                                    </SnaptradeAccountProvider>
                                </SnaptradeAuthProvider>
                            </ThemeProvider>
                        </PWAWrapper>
                    </StackTheme>
                </StackProvider>
            </body>
        </html>
    );
}
