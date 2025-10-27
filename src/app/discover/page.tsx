'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OptionsDataTable } from '@/components/OptionsDataTable';
import { OptionHorizons, OptionHorizonType } from '@/components/OptionHorizons';
import { AlpacaOptionSnapshot } from '@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2';
import { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';

export default function Discover() {
  const user = useUser();
  const [ticker, setTicker] = useState('');
  const [optionType, setOptionType] = useState<'all' | 'call' | 'put'>('all');
  const [optionHorizon, setOptionHorizon] = useState<OptionHorizonType>('make-premiums');
  const [data, setData] = useState<AlpacaOptionSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topWatchlistItems, setTopWatchlistItems] = useState<Array<{ ticker_symbol: string }>>([]);
  const [shouldAutoSearch, setShouldAutoSearch] = useState(false);

  // Fetch top watchlist items
  useEffect(() => {
    const fetchTopItems = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/watchlist/top-items?user_id=${user.id}&limit=5`);
        if (response.ok) {
          const data = await response.json();
          setTopWatchlistItems(data);
        }
      } catch (err) {
        console.error('Error fetching top watchlist items:', err);
      }
    };

    fetchTopItems();
  }, [user?.id]);

  // Calculate expiration date range based on option horizon
  const getExpirationDateRange = () => {
    const today = new Date();
    const startDate = new Date();
    const endDate = new Date();

    if (optionHorizon === 'make-premiums') {
      // 5-6 weeks out
      startDate.setDate(today.getDate() + 35); // 5 weeks
      endDate.setDate(today.getDate() + 42); // 6 weeks
    } else {
      // LEAPS: 11-13 months out
      startDate.setMonth(today.getMonth() + 11);
      endDate.setMonth(today.getMonth() + 13);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  const handleGetOptions = async () => {
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

      setData(result.options || []);
      
      if (result.options.length === 0) {
        setError('No options found for this ticker symbol');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching options:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGetOptions();
    }
  };

  const handleWatchlistPillClick = (tickerSymbol: string) => {
    setTicker(tickerSymbol);
    setShouldAutoSearch(true);
  };

  // Trigger search when watchlist pill is clicked
  useEffect(() => {
    if (shouldAutoSearch && ticker) {
      setShouldAutoSearch(false);
      handleGetOptions();
    }
  }, [shouldAutoSearch, ticker]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-7xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Options Dashboard</h1>
          <p className="text-gray-600">
            Search for options contracts by ticker symbol and view real-time market data from Alpaca
          </p>
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

        {/* Option Horizons */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Option Horizon</label>
          <OptionHorizons selected={optionHorizon} onSelect={setOptionHorizon} />
        </div>

        {/* Watchlist Quick Search Pills */}
        {topWatchlistItems.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Search from Watchlist</label>
            <div className="flex gap-2 flex-wrap">
              {topWatchlistItems.map((item) => (
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

        {data.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Options for {ticker.toUpperCase()}
              </h2>
              <span className="text-sm text-gray-600">
                {data.length} contract{data.length !== 1 ? 's' : ''} found
              </span>
            </div>
            <OptionsDataTable data={data} isLoading={isLoading} error={error} />
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
