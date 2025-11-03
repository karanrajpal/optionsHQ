"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSnaptradeAccount } from "@/context/SnaptradeAccountsProvider";
import { useUserDataAccounts } from "@/context/UserDataAccountsProvider";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate, getProfitLossColor } from "@/lib/formatters";
import { PaginatedUniversalActivity, AccountUniversalActivity } from "snaptrade-typescript-sdk";
import { AccountPicker } from "@/components/AccountPicker";
import { PageHeader } from "@/components/PageHeader";

export default function OptionsPerformancePage() {
    const { selectedAccount } = useSnaptradeAccount();
    const [activities, setActivities] = useState<AccountUniversalActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { snaptradeUserId, snaptradeUserSecret } = useUserDataAccounts();

    useEffect(() => {
        const fetchActivities = async () => {
            setLoading(true);
            setError(null);
            if (selectedAccount?.id) {
                try {
                    const response = await fetch(`/api/options-performance?accountId=${selectedAccount.id}`, {
                        headers: {
                            "user-id": snaptradeUserId as string,
                            "user-secret": snaptradeUserSecret as string,
                        }
                    });
                    
                    if (!response.ok) {
                        throw new Error(`Failed to fetch options performance: ${response.statusText}`);
                    }
                    
                    const data: PaginatedUniversalActivity = await response.json();
                    setActivities(data.data || []);
                } catch (err) {
                    console.error("Error fetching options performance:", err);
                    setError(err instanceof Error ? err.message : "Failed to fetch options performance");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchActivities();
    }, [selectedAccount?.id, snaptradeUserId, snaptradeUserSecret]);


    const getProfitLoss = (activity: AccountUniversalActivity) => {
        if (activity.amount !== null && activity.amount !== undefined) {
            return activity.amount;
        }
        if (activity.price && activity.units) {
            return activity.price * activity.units * 100;
        }
        return null;
    };



    return (
        <div className="p-4 w-full space-y-1">
            <PageHeader header="Options Performance" rightElement={<AccountPicker />} />

            {loading ? (
                <div className="mt-4 w-full grid gap-4">
                    <Skeleton className="h-14 rounded-xl" />
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            ) : null}

            {error && !loading && (
                <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
                    <p className="font-semibold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && activities && activities.length > 0 ? (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Symbol</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Strike</TableHead>
                                <TableHead>Expiry</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Fee</TableHead>
                                <TableHead>P/L</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activities.map((activity, idx) => {
                                const profitLoss = getProfitLoss(activity);
                                return (
                                    <TableRow key={activity.id || idx}>
                                        <TableCell>{formatDate(activity.trade_date)}</TableCell>
                                        <TableCell title={activity.option_symbol?.ticker || activity.symbol?.symbol || ''}>
                                            {activity.option_symbol?.ticker || activity.symbol?.symbol || '-'}
                                        </TableCell>
                                        <TableCell>{activity.option_symbol?.option_type || '-'}</TableCell>
                                        <TableCell>{activity.option_type || activity.type || '-'}</TableCell>
                                        <TableCell>
                                            {activity.option_symbol?.strike_price 
                                                ? formatCurrency(activity.option_symbol.strike_price)
                                                : '-'}
                                        </TableCell>
                                        <TableCell>{activity.option_symbol?.expiration_date || '-'}</TableCell>
                                        <TableCell>{activity.units || '-'}</TableCell>
                                        <TableCell>
                                            {activity.price ? formatCurrency(activity.price * 100) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {activity.fee ? formatCurrency(activity.fee) : '-'}
                                        </TableCell>
                                        <TableCell className={getProfitLossColor(profitLoss)}>
                                            {profitLoss !== null ? formatCurrency(profitLoss) : '-'}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            ) : (!loading && !error ? (
                <p className="text-gray-600 dark:text-gray-400">No options trading activity to display.</p>
            ) : null)}
        </div>
    );
}
