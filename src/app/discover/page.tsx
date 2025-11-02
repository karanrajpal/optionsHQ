'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { extractStrikePriceFromContractSymbol, getDaysToExpiration, OptionsDataTable } from '@/components/OptionsDataTable';
import { OptionHorizons } from '@/components/OptionHorizons';
import { AlpacaOptionSnapshot } from '@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2';
import { useState, useEffect, useCallback } from 'react';
import { useWatchlist } from '@/context/WatchlistProvider';
import { useModulePreferences } from '@/context/ModulePreferencesProvider';
import { Item, ItemTitle } from '@/components/ui/item';
import { Ticker, TickerPrice, TickerPriceChange, TickerSymbol } from '@/components/ui/shadcn-io/ticker';
import { Skeleton } from '@/components/ui/skeleton';

export type AugmentedAlpacaOptionSnapshot = AlpacaOptionSnapshot & {
  expectedReturnPercentage?: number;
  expectedAnnualizedReturnPercentage?: number;
};

export type StrategyType = 'make-premiums' | 'leaps';
export interface OptionsStrategy {
  augmentOptionsData(options: AlpacaOptionSnapshot[]): AugmentedAlpacaOptionSnapshot[];
  chooseGoodOptions(options: AugmentedAlpacaOptionSnapshot[]): AugmentedAlpacaOptionSnapshot[];
};
class MakePremiumsOptionsStrategy implements OptionsStrategy {
  public augmentOptionsData(options: AlpacaOptionSnapshot[]): AugmentedAlpacaOptionSnapshot[] {
    return options.map(option => {
      const strikePrice = extractStrikePriceFromContractSymbol(option.Symbol);
      const expectedReturnPercentage = (option.LatestQuote.BidPrice / strikePrice) * 100;
      const daysToExpiration = getDaysToExpiration(option.Symbol);
      const expectedAnnualizedReturnPercentage = expectedReturnPercentage * 365 / (daysToExpiration);
      return {
        ...option,
        expectedReturnPercentage,
        expectedAnnualizedReturnPercentage,
      };
    });
  }

  public chooseGoodOptions(options: AugmentedAlpacaOptionSnapshot[]): AugmentedAlpacaOptionSnapshot[] {
    return options
      .filter(option => option.expectedReturnPercentage && option.expectedReturnPercentage >= 0.6 && option.expectedReturnPercentage <= 1.5)
      .sort((a, b) => (b.expectedReturnPercentage || 0) - (a.expectedReturnPercentage || 0));
  }
}

export default function Discover() {
  const [ticker, setTicker] = useState('');
  const [optionType, setOptionType] = useState<'all' | 'call' | 'put'>('all');
  const [strategyType, setStrategyType] = useState<StrategyType>('make-premiums');
  const [data, setData] = useState<AugmentedAlpacaOptionSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { watchlistItems } = useWatchlist();
  const { preferences } = useModulePreferences();
  const [triggerSearchForTicker, setTriggerSearchForTicker] = useState<string | null>(null);

  useEffect(() => {
    // Also default to Call options for LEAPS
    if (optionType !== 'call') {
      setOptionType('call');
    }
  }, [strategyType]);

  // Calculate expiration date range based on option horizon
  const getExpirationDateRange = useCallback(() => {
    const today = new Date();
    const startDate = new Date();
    const endDate = new Date();

    if (strategyType === 'make-premiums') {
      // 5-6 weeks out
      startDate.setDate(today.getDate() + 35); // 5 weeks
      endDate.setDate(today.getDate() + 42); // 6 weeks
    } else {
      // LEAPS: 11-13 months out
      startDate.setMonth(today.getMonth() + 10);
      endDate.setMonth(today.getMonth() + 13);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }, [strategyType]);

  const handleGetOptions = useCallback(async () => {
    if (!ticker.trim()) {
      setError('Please enter a ticker symbol');
      return;
    }

    setIsLoading(true);
    setError(null);
    setData([]);

    try {
      // Build query parameters
      const params = new URLSearchParams({
        root_symbol: ticker.toUpperCase(),
        limit: '100',
      });

      if (optionType !== 'all') {
        params.append('type', optionType);
      }

      // Add date filter based on option horizon
      const { startDate, endDate } = getExpirationDateRange();
      params.append('expiration_date_gte', startDate);
      params.append('expiration_date_lte', endDate);

      const response = await fetch(`/api/alpaca/options?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch options data');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch options data');
      }

      if (strategyType === 'make-premiums') {
        const strategy = new MakePremiumsOptionsStrategy();
        const augmentedData = strategy.augmentOptionsData(result.options);
        const goodOptions = strategy.chooseGoodOptions(augmentedData);
        setData(goodOptions);
        if (goodOptions.length === 0) {
          setError('No good options found for this ticker symbol');
        }
        return;
      } else {
        // For LEAPS, we will define the strategy later
        setData(result.options);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching options:', err);
    } finally {
      setIsLoading(false);
    }
  }, [ticker, optionType, getExpirationDateRange]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGetOptions();
    }
  };

  const handleWatchlistPillClick = (tickerSymbol: string) => {
    setTicker(tickerSymbol);
    setTriggerSearchForTicker(tickerSymbol);
  };

  // Auto-search when watchlist pill is clicked
  useEffect(() => {
    if (triggerSearchForTicker && ticker === triggerSearchForTicker) {
      setTriggerSearchForTicker(null);
      handleGetOptions();
    }
  }, [ticker, triggerSearchForTicker, handleGetOptions]);

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-7xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Options Dashboard</h1>
          <p className="text-gray-600">
            Search for options contracts by ticker symbol and view real-time market data from Alpaca
          </p>
        </div>

        {/* Option Horizons */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Option Horizon</label>
          <OptionHorizons selected={strategyType} onSelect={setStrategyType} />
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label htmlFor="ticker" className="text-sm font-medium">
              Ticker Symbol
            </label>
            <Input
              id="ticker"
              type="text"
              placeholder="e.g., ORCL, TSLA, SPY"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              onKeyPress={handleKeyPress}
              className="uppercase"
            />
          </div>

          <div className="w-48 space-y-2">
            <label htmlFor="optionType" className="text-sm font-medium">
              Option Type
            </label>
            <Select value={optionType} onValueChange={(value: 'all' | 'call' | 'put') => setOptionType(value)}>
              <SelectTrigger id="optionType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="call">Calls</SelectItem>
                <SelectItem value="put">Puts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGetOptions}
            disabled={isLoading}
            className="px-8"
          >
            {isLoading ? 'Loading...' : 'Get Options'}
          </Button>
        </div>

        {/* Watchlist Quick Search Pills */}
        {preferences?.watchlist_enabled && watchlistItems.length > 0 && (
          <div className="space-y-2">
            <div className="flex gap-2 flex-wrap">
              {watchlistItems.map((item) => (
                <Button
                  key={item.ticker_symbol}
                  variant="outline"
                  size="sm"
                  onClick={() => handleWatchlistPillClick(item.ticker_symbol)}
                  className="rounded-full"
                >
                  {item.ticker_symbol}
                </Button>
              ))}
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
            {error}
          </div>
        )}

        {isLoading && (
          <div>
            <Skeleton className="h-60 w-full mb-4" />
          </div>
        )}

        {data.length > 0 && (
          <div className="space-y-2">
            <Item variant="outline" className="w-fit">
              <ItemTitle>
                <Ticker>
                  <TickerSymbol symbol={ticker.toUpperCase()}></TickerSymbol>
                  <TickerPrice price={watchlistItems.find(item => item.ticker_symbol === ticker)?.latest_price ?? 0} />
                  <TickerPriceChange change={watchlistItems.find(item => item.ticker_symbol === ticker)?.change_percent ?? 0} />
                </Ticker>
              </ItemTitle>
            </Item>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Options for {ticker.toUpperCase()}
              </h2>
              <span className="text-sm text-gray-600">
                {data.length} contract{data.length !== 1 ? 's' : ''} found
              </span>
            </div>
            <OptionsDataTable
              data={data}
              isLoading={isLoading}
              error={error}
              strategyType={strategyType}
            />
          </div>
        )}

        {!isLoading && !error && data.length === 0 && (
          <div className="text-center p-12 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">
              Enter a ticker symbol above to get started
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
