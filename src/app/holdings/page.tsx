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
import { formatCurrency, formatDateWithTimeAndZone, getProfitLossColor, formatNumberWithCommas } from '@/lib/formatters';
import { useSnaptradeAccount } from "@/context/SnaptradeAccountsProvider";
import { useUserDataAccounts } from "@/context/UserDataAccountsProvider";
import { useEffect, useState, useMemo } from "react";
import { AccountHoldingsAccount } from "snaptrade-typescript-sdk";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AccountPicker } from '@/components/AccountPicker';
import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export type HoldingsPosition = NonNullable<AccountHoldingsAccount['positions']>[number];

const holdingsColumns: ColumnDef<HoldingsPosition>[] = [
    {
        accessorKey: 'symbol',
        header: 'Symbol',
        cell: async ({ row }) => {
            const symbol = row.original.symbol?.symbol?.symbol;
            return (
                <Link href={`/stock/${symbol}`} className="text-blue-600 hover:underline">
                    <span title={row.original.symbol?.symbol?.description ?? ''} className='flex items-center gap-2'>
                        <Image
                            src={row.original.symbol?.symbol?.logo_url || `https://raw.githubusercontent.com/nvstly/icons/refs/heads/main/ticker_icons/${symbol}.png`}
                            alt={symbol || ''}
                            width={32}
                            height={32}
                            className="rounded-full"
                        />
                        {symbol ?? null}
                    </span>
                </Link>
            );
        },
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
        cell: ({ row }) => formatNumberWithCommas(row.original.units),
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
    {
        accessorKey: 'Value',
        header: 'Value',
        cell: ({ row }) => formatCurrency(row.original.units && row.original.price ? row.original.units * row.original.price : 0),
        enableSorting: true,
        sortingFn: (a, b) => (Number(a.original.units || 0) * Number(a.original.price || 0) || 0) - (Number(b.original.units || 0) * Number(b.original.price || 0) || 0),
    }
];

export default function HoldingsPage() {
    const { selectedAccount } = useSnaptradeAccount();
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

    // Calculate total profit/loss from the current view of the table
    const totalProfitLoss = useMemo(() => {
        const rows = table.getRowModel().rows;
        return rows.reduce((sum, row) => {
            const pnl = Number(row.original.open_pnl) || 0;
            return sum + pnl;
        }, 0);
    }, [table]);

    return (
        <div className="p-4 w-full space-y-1">
            <PageHeader
                header="Account Holdings"
                rightElement={<AccountPicker />}
            />
            
            {/* Total Profit/Loss Card */}
            {!loading && data.length > 0 && (
                <Card className="w-fit">
                    <CardHeader className="pb-3">
                        <CardDescription>Total Profit/Loss</CardDescription>
                        <CardTitle className={`text-3xl ${getProfitLossColor(totalProfitLoss)}`}>
                            {formatCurrency(totalProfitLoss)}
                        </CardTitle>
                    </CardHeader>
                </Card>
            )}

            <div className='flex justify-between'>
                <div></div>
                <div className='flex items-center text-sm'>
                    {!loading && holdings?.cache_expired && <Badge variant='destructive'>Outdated</Badge>}
                    <div className='ml-2 flex items-center text-gray-600 dark:text-gray-400'>
                        Updated at {loading
                            ? <Skeleton className="inline-block h-4 w-32 ml-1" />
                            : (holdings?.cache_timestamp ? formatDateWithTimeAndZone(holdings.cache_timestamp) : 'N/A')}
                    </div>
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
