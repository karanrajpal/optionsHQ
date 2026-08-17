"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ColumnDef, useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, SortingState, flexRender, ColumnFiltersState } from '@tanstack/react-table';
import { useSnaptradeAccount } from "@/context/SnaptradeAccountsProvider";
import { useUserDataAccounts } from "@/context/UserDataAccountsProvider";
import { useEffect, useState, useMemo } from "react";
import { formatCurrency, formatDate, getProfitLoss, getProfitLossColor, strategyTypeToDisplayName } from "@/lib/formatters";
import { MultiSelectablePill } from "@/components/MultiSelectablePill";
import { AccountPicker } from "@/components/AccountPicker";
import { PageHeader } from "@/components/PageHeader";
import { OptionsWithStrategyInformation } from "@/lib/option-strategies/option-information-service";
import { Card, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";

const optionsColumns: ColumnDef<OptionsWithStrategyInformation>[] = [
    // {
    //     accessorKey: 'id',
    //     header: 'Id',
    //     enableSorting: true,
    //     cell: ({ row }) => row.original.id || '',
    // },
    {
        accessorKey: 'strategyType',
        header: 'Strategy',
        enableSorting: true,
        cell: ({ row }) => strategyTypeToDisplayName[row.original.strategyType] || '',
        filterFn: 'arrIncludesSome',
    },
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
        accessorKey: 'strikePrice',
        header: 'Strike Price',
        enableSorting: true,
        cell: ({ row }) => formatCurrency(Number(row.original.symbol?.option_symbol?.strike_price)),
        sortingFn: (a, b) => Number(a.original.symbol?.option_symbol?.strike_price) - Number(b.original.symbol?.option_symbol?.strike_price),
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
        accessorKey: 'premiumsCollectedPerContract',
        header: 'Premium',
        enableSorting: true,
        cell: ({ row }) => formatCurrency((row.original.average_purchase_price || 0) / 100),
        sortingFn: (a, b) => Number(a.original.average_purchase_price) - Number(b.original.average_purchase_price),
    },
    {
        accessorKey: 'pl',
        header: 'Total P/L',
        enableSorting: true,
        cell: ({ row }) => {
            const pl = getProfitLoss(row.original);
            return (
                <span className={getProfitLossColor(pl)}>
                    {formatCurrency(pl)}
                </span>
            );
        },
        sortingFn: (a, b) => (getProfitLoss(a.original) - getProfitLoss(b.original)),
    },
];


export default function OptionsPage() {
    const { selectedAccount } = useSnaptradeAccount();
    const [optionHoldings, setOptionHoldings] = useState<OptionsWithStrategyInformation[] | null>(null);
    const [loading, setLoading] = useState(true);
    const { snaptradeUserId, snaptradeUserSecret } = useUserDataAccounts();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

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
    }, [selectedAccount?.id, snaptradeUserId, snaptradeUserSecret]);

    const table = useReactTable({
        data: optionHoldings || [],
        columns: optionsColumns,
        state: { sorting, columnFilters },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualSorting: false,
        debugTable: false,
    });

    // Get all unique strategy types from optionHoldings
    const strategyTypeOptions = optionHoldings
        ? Array.from(new Set(optionHoldings.map(opt => opt.strategyType)))
            .map(type => ({ value: type, label: strategyTypeToDisplayName[type] || type }))
        : [];

    // Get selected strategies from columnFilters
    const selectedStrategies = columnFilters.find(f => f.id === 'strategyType')?.value as string[] | undefined || [];

    // Handler for pill selection using column filter API
    const handleStrategyFilterChange = (values: string[]) => {
        setColumnFilters(prev => {
            // Remove existing strategyType filter
            const otherFilters = prev.filter(f => f.id !== 'strategyType');
            if (values.length === 0) return otherFilters;
            return [...otherFilters, { id: 'strategyType', value: values }];
        });
    };

    // Calculate total profit/loss from the current filtered view of the table
    const rows = table.getRowModel().rows;
    const totalProfitLoss = useMemo(() => {
        return rows.reduce((sum, row) => {
            const pnl = getProfitLoss(row.original);
            return sum + pnl;
        }, 0);
    }, [rows]);

    return (
        <div className="p-4 w-full space-y-1">
            <PageHeader
                header="Options"
                rightElement={<AccountPicker />}
            />

            {/* Total Profit/Loss Card */}
            {!loading && optionHoldings && optionHoldings.length > 0 && (
                <Card className="w-fit">
                    <CardHeader className="pb-3">
                        <CardDescription>Total Profit/Loss</CardDescription>
                        <CardTitle className={`text-3xl ${getProfitLossColor(totalProfitLoss)}`}>
                            {formatCurrency(totalProfitLoss)}
                        </CardTitle>
                    </CardHeader>
                </Card>
            )}

            {/* Filter Pills */}
            {strategyTypeOptions.length > 0 && (
                <div className="pb-2">
                    <MultiSelectablePill
                        options={strategyTypeOptions}
                        selected={selectedStrategies}
                        onChange={handleStrategyFilterChange}
                    />
                </div>
            )}

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
