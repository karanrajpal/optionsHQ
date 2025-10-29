"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDateWithTimeAndZone, getProfitLossColor } from '@/lib/formatters';
import { useSnaptradeAccount } from "@/context/SnaptradeAccountsProvider";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useUserDataAccounts } from "@/context/UserDataAccountsProvider";
import { useEffect, useState } from "react";
import { AccountHoldingsAccount } from "snaptrade-typescript-sdk";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { SiChase, SiRobinhood } from 'react-icons/si';

export type HoldingsPosition = NonNullable<AccountHoldingsAccount['positions']>[number];

const holdingsColumns: ColumnDef<HoldingsPosition>[] = [
    {
        accessorKey: 'symbol',
        header: 'Symbol',
        cell: ({ row }) => (
            <span title={row.original.symbol?.symbol?.description ?? ''}>
                {row.original.symbol?.symbol?.symbol}
            </span>
        ),
        enableSorting: true,
        sortingFn: (a, b) => {
            const sa = a.original.symbol?.symbol?.symbol || '';
            const sb = b.original.symbol?.symbol?.symbol || '';
            return sa.localeCompare(sb);
        },
    },
    {
        accessorKey: 'units',
        header: 'Quantity',
        cell: ({ row }) => row.original.units,
        enableSorting: true,
        sortingFn: (a, b) => (Number(a.original.units) || 0) - (Number(b.original.units) || 0),
    },
    {
        accessorKey: 'price',
        header: 'Current Price',
        cell: ({ row }) => formatCurrency(row.original.price),
        enableSorting: true,
        sortingFn: (a, b) => (Number(a.original.price) || 0) - (Number(b.original.price) || 0),
    },
    {
        accessorKey: 'average_purchase_price',
        header: 'Purchase Price',
        cell: ({ row }) => formatCurrency(row.original.average_purchase_price),
        enableSorting: true,
        sortingFn: (a, b) => (Number(a.original.average_purchase_price) || 0) - (Number(b.original.average_purchase_price) || 0),
    },
    {
        accessorKey: 'open_pnl',
        header: 'P/L',
        cell: ({ row }) => (
            <span className={getProfitLossColor(row.original.open_pnl)}>
                {formatCurrency(row.original.open_pnl)}
            </span>
        ),
        enableSorting: true,
        sortingFn: (a, b) => (Number(a.original.open_pnl) || 0) - (Number(b.original.open_pnl) || 0),
    },
];

export default function HoldingsPage() {
    const { selectedAccount, accounts, setSelectedAccountId } = useSnaptradeAccount();
    const [holdings, setHoldings] = useState<AccountHoldingsAccount | null>(null);
    const [loading, setLoading] = useState(true);
    const { snaptradeUserId, snaptradeUserSecret } = useUserDataAccounts();

    useEffect(() => {
        const fetchHoldings = async () => {
            setLoading(true);
            if (selectedAccount?.id) {
                const response = await fetch(`/api/snaptrade/holdings?accountId=${selectedAccount.id}`, {
                    headers: {
                        "user-id": snaptradeUserId as string,
                        "user-secret": snaptradeUserSecret as string
                    }
                });
                const data = await response.json();
                setHoldings(data);
                setLoading(false);
            } else {
                setHoldings(null);
                setLoading(false);
            }
        };
        fetchHoldings();
    }, [selectedAccount?.id]);

    // Inline HoldingsDataTable logic
    const [sorting, setSorting] = useState<SortingState>([]);
    const data = holdings?.positions ?? [];
    const table = useReactTable({
        data,
        columns: holdingsColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: { sorting },
    });

    return (
        <div className="p-8 w-full">
            <h1 className="text-2xl font-bold">Account Holdings</h1>
            <div className='flex justify-between'>
                <div>
                    <Select
                        value={selectedAccount?.id ?? undefined}
                        onValueChange={(val) => setSelectedAccountId(val)}
                        disabled={loading}
                    >
                        <SelectTrigger className="w-64">
                            <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(accounts).length > 0 ? (
                                Object.values(accounts).map((account: import("snaptrade-typescript-sdk").SnapTradeHoldingsAccount) => (
                                    account.id ? (
                                        <SelectItem key={account.id} value={account.id}>
                                            <span className="flex items-center gap-2">
                                                {account.institution_name === 'Fidelity' && (<img src="/fidelity.png" alt="Fidelity Logo" className="w-4 h-4" />)}
                                                {account.institution_name === 'Chase' && (<SiChase className="w-4 h-4" />)}
                                                {account.institution_name === 'Robinhood' && (<SiRobinhood className="w-4 h-4" />)}
                                                {account.institution_name ? `${account.institution_name} - ` : ''}{account.name}
                                            </span>
                                        </SelectItem>
                                    ) : null
                                ))
                            ) : (
                                <SelectItem value="no_accounts" disabled>No accounts found</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <div className='flex items-center'>
                    {!loading && holdings?.cache_expired && <Badge variant='destructive'>Outdated</Badge>}
                    <div className='ml-2 flex items-center'>Last updated: {loading ? <Skeleton className="inline-block h-4 w-32" /> : (holdings?.cache_timestamp ? formatDateWithTimeAndZone(holdings.cache_timestamp) : 'N/A')}</div>
                </div>
            </div>
            <div className="mt-4 w-full">
                {loading ? (
                    <div className="mt-4 w-full grid gap-4">
                        <Skeleton className="h-14 rounded-xl" />
                        <Skeleton className="h-64 rounded-xl" />
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            const canSort = header.column.getCanSort();
                                            const isSorted = header.column.getIsSorted();
                                            return (
                                                <TableHead
                                                    key={header.id}
                                                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                                                    className={canSort ? 'cursor-pointer select-none' : ''}
                                                >
                                                    {header.isPlaceholder ? null : <>{flexRender(header.column.columnDef.header, header.getContext())}{isSorted ? (isSorted === 'asc' ? ' ▲' : ' ▼') : ''}</>}
                                                </TableHead>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={holdingsColumns.length} className="h-24 text-center">
                                            No holdings to display.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
}
