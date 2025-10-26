"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSnaptradeAccount } from "@/context/SnaptradeAccountsProvider";
import { useSnaptradeAuth } from "@/context/SnaptradeAuthProvider";
import { useEffect, useState } from "react";
import { AccountHoldingsAccount } from "snaptrade-typescript-sdk";

export default function HoldingsPage() {
    const { selectedAccount } = useSnaptradeAccount();
    const [holdings, setHoldings] = useState<AccountHoldingsAccount | null>(null);
    const [loading, setLoading] = useState(true);
    const { userId, userSecret } = useSnaptradeAuth();

    useEffect(() => {
        const fetchHoldings = async () => {
            setLoading(true);
            if (selectedAccount?.id) {
                const response = await fetch(`/api/holdings?accountId=${selectedAccount.id}`, {
                    headers: {
                        "user-id": userId,
                        "user-secret": userSecret
                    }
                });
                const data = await response.json();
                setHoldings(data);
                setLoading(false);
            }
        };

        fetchHoldings();
    }, [selectedAccount?.id]);

    return (
        <div className="p-8 w-full">
            <h1 className="text-2xl font-bold">Account Holdings</h1>
            {selectedAccount ? (
                <pre>{selectedAccount.name}</pre>
            ) : (!loading ? (
                <p>No account selected</p>
            ) : null)}
            {loading ? (
                <div className="mt-4 w-full">
                    <div className="grid grid-cols-5 gap-4 mb-2">
                        <Skeleton className="h-8 rounded" />
                        <Skeleton className="h-8 rounded" />
                        <Skeleton className="h-8 rounded" />
                        <Skeleton className="h-8 rounded" />
                        <Skeleton className="h-8 rounded" />
                    </div>

                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-5 gap-4 py-2">
                            <Skeleton className="h-16 rounded" />
                            <Skeleton className="h-16 rounded" />
                            <Skeleton className="h-16 rounded" />
                            <Skeleton className="h-16 rounded" />
                            <Skeleton className="h-16 rounded" />
                        </div>
                    ))}
                </div>
            ) : null}

            {
                !loading && holdings?.positions && Object.keys(holdings?.positions).length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Symbol</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Current Price</TableHead>
                                <TableHead>Purchase Price</TableHead>
                                <TableHead>P/L</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {holdings?.positions?.map((row, rowIdx) => (
                                <TableRow key={rowIdx}>
                                    <TableCell title={row.symbol?.symbol?.description ?? ''}>{row.symbol?.symbol?.symbol}</TableCell>
                                    <TableCell>{row.units}</TableCell>
                                    <TableCell>{row.price}</TableCell>
                                    <TableCell>{row.average_purchase_price}</TableCell>
                                    <TableCell>{row.open_pnl}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (!loading ? (
                    <p>No holdings to display.</p>
                ) : null)
            }
        </div >
    );
}
