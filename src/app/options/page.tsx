"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSnaptradeAccount } from "@/context/SnaptradeAccountsProvider";
import { useUserDataAccounts } from "@/context/UserDataAccountsProvider";
import { useEffect, useState } from "react";
import { OptionsPosition } from "snaptrade-typescript-sdk";

export default function OptionsPage() {
    const { selectedAccount } = useSnaptradeAccount();
    const [optionHoldings, setOptionHoldings] = useState<OptionsPosition[] | null>(null);
    const [loading, setLoading] = useState(true);
    const { snaptradeUserId, snaptradeUserSecret } = useUserDataAccounts();

    useEffect(() => {
        const fetchHoldings = async () => {
            setLoading(true);
            if (selectedAccount?.id) {
                const response = await fetch(`/api/snaptrade/option_holdings?accountId=${selectedAccount.id}`, {
                    headers: {
                        "user-id": snaptradeUserId as string,
                        "user-secret": snaptradeUserSecret as string,
                    }
                });
                const data = await response.json();
                setOptionHoldings(data);
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
                !loading && optionHoldings && optionHoldings.length > 0 ? (
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
                            {optionHoldings?.map((row, rowIdx) => (
                                <TableRow key={rowIdx}>
                                    <TableCell title={row.symbol?.option_symbol?.underlying_symbol.symbol ?? ''}>{row.symbol?.option_symbol?.underlying_symbol.symbol}</TableCell>
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
