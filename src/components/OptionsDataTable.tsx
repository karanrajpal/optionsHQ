'use client';

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
import { AlpacaOptionSnapshot } from '@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2';
import { useState } from 'react';

const extractDateFromContractSymbol = (contract: string) => {
  const dateMatch = contract.match(/\d+/);
  const dateString = dateMatch ? dateMatch[0] : '';
  const date = new Date(
    `20${dateString.substring(0, 2)}-${dateString.substring(2, 4)}-${dateString.substring(4, 6)}`
  );
  return date;
};

export const columns: ColumnDef<AlpacaOptionSnapshot>[] = [
  {
    accessorKey: 'symbol',
    header: 'Symbol',
    cell: ({ row }) => <div className="font-mono text-xs">{row?.original?.Symbol}</div>,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const match = row?.original?.Symbol?.match(/\d{6}(\w)/);
      const type = match ? match[1] === 'C' ? 'call' : 'put' : null;
      return (
        <div className={`font-semibold ${type === 'call' ? 'text-green-600' : 'text-red-600'}`}>
          {type?.toUpperCase()}
        </div>
      );
    },
  },
  {
    accessorKey: 'strike_price',
    header: 'Strike Price',
    cell: ({ row }) => {
      const strikePriceMatch = row?.original?.Symbol?.match(/\d{6}[CP](\d+)/);
      const strikePrice = strikePriceMatch ? parseFloat(strikePriceMatch[1]) / 1000 : 0;
      return <div>${strikePrice.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: 'expiration_date',
    header: 'Expiration Date',
    cell: ({ row }) => {
      const date = extractDateFromContractSymbol(row?.original?.Symbol);
      return <div>{date?.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}</div>;
    },
  },
  {
    accessorKey: 'snapshot',
    header: 'Last Price',
    cell: ({ row }) => {
      const snapshot = row.original;
      const lastPrice = snapshot?.LatestTrade?.Price || snapshot?.LatestQuote?.AskPrice || snapshot?.LatestQuote?.BidPrice || 0;
      return lastPrice ? <div>${lastPrice.toFixed(2)}</div> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'snapshot.latestQuote.bp',
    header: 'Bid',
    cell: ({ row }) => {
      const bid = row.original?.LatestQuote?.BidPrice;
      return bid ? <div>${bid.toFixed(2)}</div> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'snapshot.latestQuote.ap',
    header: 'Ask',
    cell: ({ row }) => {
      const ask = row.original?.LatestQuote?.AskPrice;
      return ask ? <div>${ask.toFixed(2)}</div> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'days_to_expiration',
    header: 'Days to Expiration',
    cell: ({ row }) => {
      const date = extractDateFromContractSymbol(row?.original?.Symbol);
      const today = new Date();
      const daysToExpiration = date ? Math.ceil((date.getTime() - today.getTime()) / (1000 * 3600 * 24)) : null;
      return <div>{daysToExpiration || '-'}</div>;
    },
  },
  {
    accessorKey: 'snapshot.impliedVolatility',
    header: 'IV',
    cell: ({ row }) => {
      const iv = (row.original as any).ImpliedVolatility;
      return iv ? <div>{(iv * 100).toFixed(2)}%</div> : <div className="text-gray-400">-</div>;
    },
  },
];

interface OptionsDataTableProps {
  data: AlpacaOptionSnapshot[];
  isLoading?: boolean;
  error?: string | null;
}

export function OptionsDataTable({ data, isLoading, error }: OptionsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

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
