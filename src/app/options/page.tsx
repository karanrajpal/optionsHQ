"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ColumnDef, useReactTable, getCoreRowModel, getSortedRowModel, SortingState, flexRender } from '@tanstack/react-table';
import { useSnaptradeAccount } from "@/context/SnaptradeAccountsProvider";
import { useUserDataAccounts } from "@/context/UserDataAccountsProvider";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate, getProfitLossColor } from "@/lib/formatters";
import { OptionsPosition, SnapTradeHoldingsAccount } from "snaptrade-typescript-sdk";
import { AccountPicker } from "@/components/AccountPicker";
import { PageHeader } from "@/components/PageHeader";

const optionsColumns: ColumnDef<OptionsPosition>[] = [
    {
        accessorKey: 'symbol',
        header: 'Symbol',
        enableSorting: true,
        cell: ({ row }) => row.original.symbol?.option_symbol?.underlying_symbol.symbol || '',
        sortingFn: (a, b) => {
            const symbolA = a.original.symbol?.option_symbol?.underlying_symbol.symbol || '';
            const symbolB = b.original.symbol?.option_symbol?.underlying_symbol.symbol || '';
            return symbolA.localeCompare(symbolB);
        },
    },
    {
        accessorKey: 'type',
        header: 'Type',
        enableSorting: true,
        cell: ({ row }) => row.original.symbol?.option_symbol?.option_type || '',
        sortingFn: (a, b) => {
            const typeA = a.original.symbol?.option_symbol?.option_type || '';
            const typeB = b.original.symbol?.option_symbol?.option_type || '';
            return typeA.localeCompare(typeB);
        }
    },
    {
        accessorKey: 'expiry',
        header: 'Expiry',
        enableSorting: true,
        cell: ({ row }) => formatDate(row.original.symbol?.option_symbol?.expiration_date),
        sortingFn: (a, b) => {
            const dateA = new Date(a.original.symbol?.option_symbol?.expiration_date || '');
            const dateB = new Date(b.original.symbol?.option_symbol?.expiration_date || '');
            return dateA.getTime() - dateB.getTime();
        }
    },
    {
        accessorKey: 'quantity',
        header: 'Quantity',
        enableSorting: true,
        cell: ({ row }) => row.original.units,
        sortingFn: (a, b) => (a.original.units ?? 0) - (b.original.units ?? 0),
    },
    {
        accessorKey: 'currentPrice',
        header: 'Current Price',
        enableSorting: true,
        cell: ({ row }) => formatCurrency(Number(row.original.price)),
        sortingFn: (a, b) => Number(a.original.price) - Number(b.original.price),
    },
    {
        accessorKey: 'purchasePrice',
        header: 'Purchase Price',
        enableSorting: true,
        cell: ({ row }) => formatCurrency(row.original.average_purchase_price),
        sortingFn: (a, b) => Number(a.original.average_purchase_price) - Number(b.original.average_purchase_price),
    },
    {
        accessorKey: 'pl',
        header: 'P/L',
        enableSorting: true,
        cell: ({ row }) => {
            const pl = (Number(row.original.price) * 100) - Number(row.original.average_purchase_price);
            return (
                <span className={getProfitLossColor(pl)}>
                    {formatCurrency(pl)}
                </span>
            );
        },
        sortingFn: (a, b) => ((Number(a.original.price) * 100) - Number(a.original.average_purchase_price)) - ((Number(b.original.price) * 100) - Number(b.original.average_purchase_price)),
    },
];

export default function OptionsPage() {
    const { selectedAccount } = useSnaptradeAccount();
    const [optionHoldings, setOptionHoldings] = useState<OptionsPosition[] | null>(null);
    const [loading, setLoading] = useState(true);
    const { snaptradeUserId, snaptradeUserSecret } = useUserDataAccounts();
    const [sorting, setSorting] = useState<SortingState>([]);

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

    const table = useReactTable({
        data: optionHoldings || [],
        columns: optionsColumns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualSorting: false,
        debugTable: false,
    });

    return (
        <div className="p-6 w-full space-y-1">
            <PageHeader
                header="Options"
                rightElement={<AccountPicker />}
            />

            {loading ? (
                <div className="mt-4 w-full grid gap-4">
                    <Skeleton className="h-14 rounded-xl" />
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            ) : null}

            {
                !loading && table.getRowModel().rows.length > 0 ? (
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map(headerGroup => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {header.isPlaceholder ? null :
                                                <>
                                                    {header.column.columnDef.header as string}
                                                    {header.column.getIsSorted() ? (header.column.getIsSorted() === 'asc' ? ' ▲' : ' ▼') : ''}
                                                </>
                                            }
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
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
