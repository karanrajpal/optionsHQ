'use client';

import { OptionsSearchBar } from '@/components/OptionsSearchBar';
import { extractStrikePriceFromContractSymbol, getDaysToExpiration, OptionsDataTable } from '@/components/OptionsDataTable';
import { OptionHorizons } from '@/components/OptionHorizons';
import { AlpacaOptionSnapshot } from '@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2';
import { useState, useEffect, useCallback } from 'react';
import { useWatchlist } from '@/context/WatchlistProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { TickerPriceItem } from '@/components/TickerPriceItem';
import { PageHeader } from '@/components/PageHeader';

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

  

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-7xl space-y-2">
        <PageHeader
          header="Options Discovery"
          subheader="Search for options contracts by ticker symbol and view real-time market data from Alpaca"
        />

        {/* Option Horizons */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Strategy</label>
          <OptionHorizons selected={strategyType} onSelect={setStrategyType} />
        </div>

        <OptionsSearchBar
          ticker={ticker}
          onTickerChange={setTicker}
          optionType={optionType}
          onOptionTypeChange={setOptionType}
          onSearch={handleGetOptions}
          isLoading={isLoading}
        />

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
            <TickerPriceItem
              ticker={ticker}
              latestPrice={watchlistItems.find(item => item.ticker_symbol === ticker)?.latest_price ?? 0}
              changePercent={watchlistItems.find(item => item.ticker_symbol === ticker)?.change_percent ?? 0}
            />
            <OptionsDataTable
              ticker={ticker}
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
