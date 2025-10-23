'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlpacaOptionContractWithSnapshot } from '@/lib/alpaca';

export const columns: ColumnDef<AlpacaOptionContractWithSnapshot>[] = [
  {
    accessorKey: 'symbol',
    header: 'Symbol',
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue('symbol')}</div>,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      return (
        <div className={`font-semibold ${type === 'call' ? 'text-green-600' : 'text-red-600'}`}>
          {type.toUpperCase()}
        </div>
      );
    },
  },
  {
    accessorKey: 'strike_price',
    header: 'Strike Price',
    cell: ({ row }) => {
      const strikePrice = parseFloat(row.getValue('strike_price'));
      return <div>${strikePrice.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: 'expiration_date',
    header: 'Expiration Date',
    cell: ({ row }) => {
      const date = new Date(row.getValue('expiration_date'));
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: 'snapshot',
    header: 'Last Price',
    cell: ({ row }) => {
      const snapshot = row.original.snapshot;
      const lastPrice = snapshot?.latestTrade?.p || snapshot?.latestQuote?.ap;
      return lastPrice ? <div>${lastPrice.toFixed(2)}</div> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'snapshot.latestQuote.bp',
    header: 'Bid',
    cell: ({ row }) => {
      const bid = row.original.snapshot?.latestQuote?.bp;
      return bid ? <div>${bid.toFixed(2)}</div> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'snapshot.latestQuote.ap',
    header: 'Ask',
    cell: ({ row }) => {
      const ask = row.original.snapshot?.latestQuote?.ap;
      return ask ? <div>${ask.toFixed(2)}</div> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'open_interest',
    header: 'Open Interest',
    cell: ({ row }) => {
      const openInterest = row.getValue('open_interest');
      return <div>{openInterest || '-'}</div>;
    },
  },
  {
    accessorKey: 'snapshot.impliedVolatility',
    header: 'IV',
    cell: ({ row }) => {
      const iv = row.original.snapshot?.impliedVolatility;
      return iv ? <div>{(iv * 100).toFixed(2)}%</div> : <div className="text-gray-400">-</div>;
    },
  },
];

interface OptionsDataTableProps {
  data: AlpacaOptionContractWithSnapshot[];
  isLoading?: boolean;
  error?: string | null;
}

export function OptionsDataTable({ data, isLoading, error }: OptionsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading options data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
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
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No options data available. Enter a ticker symbol and click &quot;Get Options&quot;.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
