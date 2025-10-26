'use client';
import { AccountCheckup } from "@/components/AccountCheckup";
import ConnectBroker from "@/components/ConnectBroker";
import { useSnaptradeAuth } from '@/context/SnaptradeAuthProvider';

export default function Home() {
    const { isLoggedIn } = useSnaptradeAuth();

    return (
        <main className="flex min-h-screen flex-col items-center p-24">
            {!isLoggedIn ? <ConnectBroker /> : (
                <>
                    <AccountCheckup />
                </>
            )}
        </main>
    );
}
