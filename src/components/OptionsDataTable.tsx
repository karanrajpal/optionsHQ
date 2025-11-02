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
import { useMemo, useState } from 'react';
import { AugmentedAlpacaOptionSnapshot, StrategyType } from '@/app/discover/page';
import { extractDateFromContractSymbol, extractStrikePriceFromContractSymbol, getDaysToExpiration } from '@/lib/formatters';

export const baseColumns: ColumnDef<AugmentedAlpacaOptionSnapshot>[] = [
  {
    accessorKey: 'symbol',
    header: 'Symbol',
    cell: ({ row }) => {
      const symbol = row?.original?.Symbol?.match(/^[A-Za-z]+/)?.[0];
      return <div className="font-mono text-xs">{symbol}</div>;
    },
    enableSorting: true,
    sortingFn: (a, b) => {
      const symbolA = a.original?.Symbol || '';
      const symbolB = b.original?.Symbol || '';
      return symbolA.localeCompare(symbolB);
    },
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
    enableSorting: true,
    sortingFn: (a, b) => {
      const typeA = (() => {
        const match = a.original?.Symbol?.match(/\d{6}(\w)/);
        return match ? match[1] === 'C' ? 'call' : 'put' : '';
      })();
      const typeB = (() => {
        const match = b.original?.Symbol?.match(/\d{6}(\w)/);
        return match ? match[1] === 'C' ? 'call' : 'put' : '';
      })();
      return typeA.localeCompare(typeB);
    },
  },
  {
    accessorKey: 'strike_price',
    header: 'Strike Price',
    cell: ({ row }) => {
      const strikePrice = extractStrikePriceFromContractSymbol(row?.original?.Symbol);
      return <div>${strikePrice.toFixed(2)}</div>;
    },
    enableSorting: true,
    sortingFn: (a, b) => {
      const strikeA = (() => {
        const match = a.original?.Symbol?.match(/\d{6}[CP](\d+)/);
        return match ? parseFloat(match[1]) / 1000 : 0;
      })();
      const strikeB = (() => {
        const match = b.original?.Symbol?.match(/\d{6}[CP](\d+)/);
        return match ? parseFloat(match[1]) / 1000 : 0;
      })();
      return strikeA - strikeB;
    },
  },
  {
    accessorKey: 'expiration_date',
    header: 'Expiration Date',
    cell: ({ row }) => {
      const date = extractDateFromContractSymbol(row?.original?.Symbol);
      return <div>{date?.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}</div>;
    },
    enableSorting: true,
    sortingFn: (a, b) => {
      const dateA = extractDateFromContractSymbol(a.original?.Symbol || '');
      const dateB = extractDateFromContractSymbol(b.original?.Symbol || '');
      return dateA.getTime() - dateB.getTime();
    },
  },
  {
    accessorKey: 'last_price',
    header: 'Last Price',
    cell: ({ row }) => {
      const snapshot = row.original;
      const lastPrice = snapshot?.LatestTrade?.Price || snapshot?.LatestQuote?.AskPrice || snapshot?.LatestQuote?.BidPrice || 0;
      return lastPrice ? <div>${lastPrice.toFixed(2)}</div> : <div className="text-gray-400">-</div>;
    },
    enableSorting: true,
    sortingFn: (a, b) => {
      const lastPriceA = a.original?.LatestTrade?.Price || a.original?.LatestQuote?.AskPrice || a.original?.LatestQuote?.BidPrice || 0;
      const lastPriceB = b.original?.LatestTrade?.Price || b.original?.LatestQuote?.AskPrice || b.original?.LatestQuote?.BidPrice || 0;
      return lastPriceA - lastPriceB;
    },
  },
  {
    accessorKey: 'snapshot.latestQuote.bp',
    header: 'Bid',
    cell: ({ row }) => {
      const bid = row.original?.LatestQuote?.BidPrice;
      return bid ? <div>${bid.toFixed(2)}</div> : <div className="text-gray-400">-</div>;
    },
    enableSorting: true,
    sortingFn: (a, b) => {
      const bidA = a.original?.LatestQuote?.BidPrice || 0;
      const bidB = b.original?.LatestQuote?.BidPrice || 0;
      return bidA - bidB;
    },
  },
  {
    accessorKey: 'snapshot.latestQuote.ap',
    header: 'Ask',
    cell: ({ row }) => {
      const ask = row.original?.LatestQuote?.AskPrice;
      return ask ? <div>${ask.toFixed(2)}</div> : <div className="text-gray-400">-</div>;
    },
    enableSorting: true,
    sortingFn: (a, b) => {
      const askA = a.original?.LatestQuote?.AskPrice || 0;
      const askB = b.original?.LatestQuote?.AskPrice || 0;
      return askA - askB;
    },
  },
  {
    accessorKey: 'days_to_expiration',
    header: 'Days to Expiration',
    cell: ({ row }) => {
      const daysToExpiration = getDaysToExpiration(row?.original?.Symbol);
      return <div>{daysToExpiration || '-'}</div>;
    },
    enableSorting: true,
    sortingFn: (a, b) => {
      const dateA = extractDateFromContractSymbol(a.original?.Symbol || '');
      const dateB = extractDateFromContractSymbol(b.original?.Symbol || '');
      const today = new Date();
      const daysA = dateA ? Math.ceil((dateA.getTime() - today.getTime()) / (1000 * 3600 * 24)) : Infinity;
      const daysB = dateB ? Math.ceil((dateB.getTime() - today.getTime()) / (1000 * 3600 * 24)) : Infinity;
      return daysA - daysB;
    }
  },
  {
    accessorKey: 'snapshot.delta',
    header: 'Delta',
    cell: ({ row }) => {
      const delta = (row.original.Greeks as any)?.delta;
      return delta ? <div>{delta.toFixed(4)}</div> : <div className="text-gray-400">-</div>;
    },
    enableSorting: true,
    sortingFn: (a, b) => {
      const deltaA = (a.original.Greeks as any)?.delta || 0;
      const deltaB = (b.original.Greeks as any)?.delta || 0;
      return deltaA - deltaB;
    },
  },
  {
    accessorKey: 'snapshot.theta',
    header: 'Theta',
    cell: ({ row }) => {
      const theta = (row.original.Greeks as any)?.theta;
      return theta ? <div>{theta.toFixed(4)}</div> : <div className="text-gray-400">-</div>;
    },
    enableSorting: true,
    sortingFn: (a, b) => {
      const thetaA = (a.original.Greeks as any)?.theta || 0;
      const thetaB = (b.original.Greeks as any)?.theta || 0;
      return thetaA - thetaB;
    },
  },
  {
    accessorKey: 'snapshot.impliedVolatility',
    header: 'IV',
    cell: ({ row }) => {
      const iv = (row.original as any).ImpliedVolatility;
      return iv ? <div>{(iv * 100).toFixed(2)}%</div> : <div className="text-gray-400">-</div>;
    },
    enableSorting: true,
    sortingFn: (a, b) => {
      const ivA = (a.original as any).ImpliedVolatility || 0;
      const ivB = (b.original as any).ImpliedVolatility || 0;
      return ivA - ivB;
    },
  },
];

interface OptionsDataTableProps {
  data: AugmentedAlpacaOptionSnapshot[];
  isLoading?: boolean;
  error?: string | null;
  strategyType: StrategyType;
  ticker: string;
};

function addColumnDefsForStrategyType(columns: ColumnDef<AugmentedAlpacaOptionSnapshot>[], strategyType: StrategyType): ColumnDef<AugmentedAlpacaOptionSnapshot>[] {
  const augmentedColumns = [...columns];
  if (strategyType === 'make-premiums') {
    augmentedColumns.push(
      {
        accessorKey: 'expectedReturnPercentage',
        header: 'Exp. Return %',
        cell: ({ row }) => {
          const expReturn = (row.original as any).expectedReturnPercentage;
          return expReturn !== undefined ? <div>{expReturn.toFixed(2)}%</div> : <div className="text-gray-400">-</div>;
        },
        enableSorting: true,
        sortingFn: (a, b) => {
          const retA = (a.original as any).expectedReturnPercentage || 0;
          const retB = (b.original as any).expectedReturnPercentage || 0;
          return retA - retB;
        },
      },
      {
        accessorKey: 'expectedAnnualizedReturnPercentage',
        header: 'Exp. Ann. Return %',
        cell: ({ row }) => {
          const expAnnReturn = row.original.expectedAnnualizedReturnPercentage;
          return expAnnReturn !== undefined ? <div>{expAnnReturn.toFixed(2)}%</div> : <div className="text-gray-400">-</div>;
        },
        enableSorting: true,
        sortingFn: (a, b) => {
          const retA = a.original.expectedAnnualizedReturnPercentage || 0;
          const retB = b.original.expectedAnnualizedReturnPercentage || 0;
          return retA - retB;
        },
      });
  } else if (strategyType === 'leaps') {
  }
  return augmentedColumns;
}


export function OptionsDataTable({ data, isLoading, error, strategyType, ticker }: OptionsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(() => addColumnDefsForStrategyType(baseColumns, strategyType), [baseColumns, strategyType]);

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
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Options for {ticker.toUpperCase()}
        </h2>
        <span className="text-sm text-gray-600">
          {data.length} contract{data.length !== 1 ? 's' : ''} found
        </span>
      </div>
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
                      className={canSort ? 'cursor-pointer select-none px-2' : 'px-2'}
                    >
                      {header.isPlaceholder
                        ? null
                        : (
                          <>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {isSorted ? (isSorted === 'asc' ? ' ▲' : ' ▼') : ''}
                          </>
                        )}
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
                    <TableCell key={cell.id} className='px-2'>
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
    </div>
  );
}
