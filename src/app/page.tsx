'use client';
import ConnectBrokerage from "@/components/ConnectBrokerage";
import ExampleComponentFetchingData from "@/components/example-component-fetching-data";
import { OptionsJournalTable } from "@/components/OptionsJournalTable";
import { useAuth } from '@/context/AuthProvider';

export default function Home() {
    const { isLoggedIn } = useAuth();

    return (
        <main className="flex min-h-screen flex-col items-center p-24">
            {!isLoggedIn ? <ConnectBrokerage /> : (
                <>
                    <ExampleComponentFetchingData />
                    <OptionsJournalTable />
                </>
            )}
        </main>
    );
}
