"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSnaptradeAccount } from "@/context/SnaptradeAccountsProvider";
import { useUserDataAccounts } from "@/context/UserDataAccountsProvider";
import { useEffect, useState } from "react";
import { AccountHoldingsAccount } from "snaptrade-typescript-sdk";

export default function OptionsPage() {
    const { selectedAccount } = useSnaptradeAccount();
    const [holdings, setHoldings] = useState<AccountHoldingsAccount | null>(null);
    const [loading, setLoading] = useState(true);
    const { snaptradeUserId, snaptradeUserSecret } = useUserDataAccounts();

    useEffect(() => {
        const fetchHoldings = async () => {
            setLoading(true);
            if (selectedAccount?.id) {
                const response = await fetch(`/api/holdings?accountId=${selectedAccount.id}`, {
                    headers: {
                        "user-id": snaptradeUserId as string,
                        "user-secret": snaptradeUserSecret as string,
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
            <h1 className="text-2xl font-bold">Options</h1>
            {selectedAccount ? (
                <pre>{selectedAccount.name}</pre>
            ) : (!loading ? (
                <p>No account selected</p>
            ) : null)}
            {loading ? (
                <div className="mt-4 w-full grid gap-4">
                    <Skeleton className="h-14 rounded-xl" />
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            ) : null}

            {
                !loading && holdings?.option_positions && Object.keys(holdings?.option_positions).length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Symbol</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Expiry</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Current Price</TableHead>
                                <TableHead>Purchase Price</TableHead>
                                <TableHead>P/L</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {holdings?.option_positions?.map((row, rowIdx) => (
                                <TableRow key={rowIdx}>
                                    <TableCell title={row.symbol?.option_symbol?.ticker ?? ''}>{row.symbol?.option_symbol?.ticker}</TableCell>
                                    <TableCell>{row.symbol?.option_symbol?.option_type ?? ''}</TableCell>
                                    <TableCell>{row.symbol?.option_symbol?.expiration_date ?? ''}</TableCell>
                                    <TableCell>{row.units}</TableCell>
                                    <TableCell>{(Number(row.price) * 100).toFixed(2)}</TableCell>
                                    <TableCell>{row.average_purchase_price}</TableCell>
                                    <TableCell>{((Number(row.price) * 100) - Number(row.average_purchase_price)).toFixed(2)}</TableCell>
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
