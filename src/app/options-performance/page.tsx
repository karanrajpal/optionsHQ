"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSnaptradeAccount } from "@/context/SnaptradeAccountsProvider";
import { useUserDataAccounts } from "@/context/UserDataAccountsProvider";
import { useEffect, useState } from "react";

interface OptionActivity {
    id?: string;
    symbol?: {
        id?: string;
        symbol?: string;
        description?: string;
    };
    option_symbol?: {
        ticker?: string;
        option_type?: string;
        strike_price?: number;
        expiration_date?: string;
    };
    price?: number;
    units?: number;
    amount?: number | null;
    type?: string;
    option_type?: string;
    description?: string;
    trade_date?: string | null;
    fee?: number;
}

interface PaginatedActivities {
    activities?: OptionActivity[];
    total?: number;
}

export default function OptionsPerformancePage() {
    const { selectedAccount } = useSnaptradeAccount();
    const [activities, setActivities] = useState<OptionActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const { snaptradeUserId, snaptradeUserSecret } = useUserDataAccounts();

    useEffect(() => {
        const fetchActivities = async () => {
            setLoading(true);
            if (selectedAccount?.id) {
                const response = await fetch(`/api/options-performance?accountId=${selectedAccount.id}`, {
                    headers: {
                        "user-id": snaptradeUserId as string,
                        "user-secret": snaptradeUserSecret as string,
                    }
                });
                const data: PaginatedActivities = await response.json();
                setActivities(data.activities || []);
                setLoading(false);
            }
        };

        fetchActivities();
    }, [selectedAccount?.id, snaptradeUserId, snaptradeUserSecret]);

    const formatCurrency = (value: number | null | undefined) => {
        if (value === null || value === undefined) return "-";
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString();
    };

    const getProfitLoss = (activity: OptionActivity) => {
        if (activity.amount !== null && activity.amount !== undefined) {
            return activity.amount;
        }
        if (activity.price && activity.units) {
            return activity.price * activity.units * 100;
        }
        return null;
    };

    const getProfitLossColor = (profitLoss: number | null) => {
        if (profitLoss === null) return "";
        return profitLoss >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
    };

    return (
        <div className="p-8 w-full">
            <h1 className="text-2xl font-bold mb-4">Options Performance</h1>
            {selectedAccount ? (
                <p className="mb-4 text-gray-600 dark:text-gray-400">Account: {selectedAccount.name}</p>
            ) : (!loading ? (
                <p>No account selected</p>
            ) : null)}
            
            {loading ? (
                <div className="mt-4 w-full">
                    <div className="grid grid-cols-7 gap-4 mb-2">
                        <Skeleton className="h-8 rounded" />
                        <Skeleton className="h-8 rounded" />
                        <Skeleton className="h-8 rounded" />
                        <Skeleton className="h-8 rounded" />
                        <Skeleton className="h-8 rounded" />
                        <Skeleton className="h-8 rounded" />
                        <Skeleton className="h-8 rounded" />
                    </div>

                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-7 gap-4 py-2">
                            <Skeleton className="h-16 rounded" />
                            <Skeleton className="h-16 rounded" />
                            <Skeleton className="h-16 rounded" />
                            <Skeleton className="h-16 rounded" />
                            <Skeleton className="h-16 rounded" />
                            <Skeleton className="h-16 rounded" />
                            <Skeleton className="h-16 rounded" />
                        </div>
                    ))}
                </div>
            ) : null}

            {!loading && activities && activities.length > 0 ? (
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
            ) : (!loading ? (
                <p className="text-gray-600 dark:text-gray-400">No options trading activity to display.</p>
            ) : null)}
        </div>
    );
}
