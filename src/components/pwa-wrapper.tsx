"use client"

import { ReactNode, useEffect } from "react";

type PWAWrapperProps = {
    children: ReactNode;
};
export function PWAWrapper({ children }: PWAWrapperProps) {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js', {
                scope: '/',
                updateViaCache: 'none',
            })
                .then((registration) => console.log(`Service worker registered with scope ${registration.scope}`))
                .catch((error) => console.log(`Service Worker registration failed' ${error}`));
        }
    }, []);
    return <>{children}</>
}
