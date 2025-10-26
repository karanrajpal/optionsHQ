'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OptionsDataTable } from '@/components/OptionsDataTable';
import { AlpacaOptionSnapshot } from '@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2';
import { useState } from 'react';

export default function Discover() {
  const [ticker, setTicker] = useState('');
  const [optionType, setOptionType] = useState<'all' | 'call' | 'put'>('all');
  const [data, setData] = useState<AlpacaOptionSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Add date filter to get options expiring in the next 60 days
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 60);
      
      params.append('expiration_date_gte', today.toISOString().split('T')[0]);
      params.append('expiration_date_lte', futureDate.toISOString().split('T')[0]);

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
              placeholder="e.g., AAPL, TSLA, SPY"
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
