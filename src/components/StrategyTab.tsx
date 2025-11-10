import { useState, useCallback, useEffect } from 'react';
import { OptionsSearchBar } from '@/components/OptionsSearchBar';
import { OptionsDataTable } from '@/components/OptionsDataTable';
import { Skeleton } from '@/components/ui/skeleton';
import type { AugmentedAlpacaOptionSnapshot, StrategyType } from '@/app/discover/page';
import { useUserDataAccounts } from '@/context/UserDataAccountsProvider';
import { useSnaptradeAccount } from '@/context/SnaptradeAccountsProvider';
import { OptionsWithStockData } from '@/app/api/alpaca/options/bulk/route';
import { StockCard } from './StockCard';
import { TextShimmer } from './ui/text-shimmer';
import { getChangePercentFromAlpacaSnapshot, getChangeValueFromAlpacaSnapshot } from '@/lib/formatters';


interface StrategyTabProps {
  strategyType: StrategyType;
};

const STRATEGY_TYPE_TO_OPTION_TYPES: Record<StrategyType, ('all' | 'call' | 'put')> = {
  'covered-calls': 'call',
  'leaps': 'call',
  'cash-secured-puts': 'put',
};

export function StrategyTab({ strategyType }: StrategyTabProps) {
  const [ticker, setTicker] = useState('');
  const [optionType, setOptionType] = useState<'all' | 'call' | 'put'>(STRATEGY_TYPE_TO_OPTION_TYPES[strategyType]);
  const [optionSearchDataWithStockInfo, setOptionSearchDataWithStockInfo] = useState<OptionsWithStockData>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { snaptradeUserId, snaptradeUserSecret, isUserAccountDetailsLoading } = useUserDataAccounts();
  const { selectedAccount, accountsLoading } = useSnaptradeAccount();

  // Recommended options state
  const [recommended, setRecommended] = useState<Record<string, OptionsWithStockData>>({});
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [recommendedError, setRecommendedError] = useState<string | null>(null);
  // Fetch recommended options on mount or when strategyType changes
  useEffect(() => {
    let ignore = false;
    async function fetchRecommended() {
      setRecommendedLoading(true);
      setRecommendedError(null);
      setRecommended({});
      try {
        if (isUserAccountDetailsLoading || accountsLoading) return;
        if (!snaptradeUserId || !snaptradeUserSecret || !selectedAccount?.id) {
          throw new Error('Missing user credentials');
        }
        const params = new URLSearchParams({
          strategy: strategyType,
          accountId: selectedAccount.id,
        });
        const response = await fetch(`/api/alpaca/options/bulk?${params.toString()}`, {
          headers: {
            'user-id': snaptradeUserId,
            'user-secret': snaptradeUserSecret,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch recommended options');
        }
        const result = await response.json();
        if (!result || typeof result !== 'object') {
          throw new Error('Failed to fetch recommended options');
        }
        if (!ignore) setRecommended(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        if (!ignore) setRecommendedError(errorMessage);
      } finally {
        if (!ignore) setRecommendedLoading(false);
      }
    }
    fetchRecommended();
    return () => { ignore = true; };
  }, [strategyType, snaptradeUserId, snaptradeUserSecret, selectedAccount?.id]);

  // For LEAPS, always use call options
  const effectiveOptionType = strategyType === 'leaps' ? 'call' : optionType;

  // Calculate expiration date range based on option horizon
  const getExpirationDateRange = useCallback(() => {
    const today = new Date();
    const startDate = new Date();
    const endDate = new Date();

    if (strategyType === 'covered-calls') {
      startDate.setDate(today.getDate() + 35);
      endDate.setDate(today.getDate() + 42);
    } else {
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
    setOptionSearchDataWithStockInfo(undefined);
    try {
      const params = new URLSearchParams({
        root_symbol: ticker.toUpperCase(),
        limit: '100',
        strategyType,
      });
      if (effectiveOptionType !== 'all') {
        params.append('type', effectiveOptionType);
      }
      const { startDate, endDate } = getExpirationDateRange();
      params.append('expiration_date_gte', startDate);
      params.append('expiration_date_lte', endDate);
      const response = await fetch(`/api/alpaca/options?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch options optionSearchDataWithStockInfo');
      }
      const result: OptionsWithStockData = await response.json();
      setOptionSearchDataWithStockInfo(result);
      if (result.options.length === 0) {
        setError('No good options found for this ticker symbol');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching options:', err);
    } finally {
      setIsLoading(false);
    }
  }, [ticker, effectiveOptionType, getExpirationDateRange, strategyType]);

  return (
    <div className="space-y-4">
      <OptionsSearchBar
        ticker={ticker}
        onTickerChange={setTicker}
        optionType={effectiveOptionType}
        onOptionTypeChange={setOptionType}
        onSearch={handleGetOptions}
        isLoading={isLoading}
        // Disable option type based on strategy
        disableOptionType={strategyType === 'leaps' || strategyType === 'covered-calls' || strategyType === 'cash-secured-puts'}
      />
      {error && !isLoading && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">{error}</div>
      )}
      {isLoading && <Skeleton className="h-60 w-full mb-4" />}
      {optionSearchDataWithStockInfo?.options && (
        <div className="space-y-2">
          <StockCard
            ticker={(optionSearchDataWithStockInfo.stockData?.snapshot as any).symbol || ''}
            latestPrice={optionSearchDataWithStockInfo.stockData?.snapshot.LatestQuote.AskPrice || 0}
            changePrice={getChangeValueFromAlpacaSnapshot(optionSearchDataWithStockInfo.stockData?.snapshot)}
            changePercent={getChangePercentFromAlpacaSnapshot(optionSearchDataWithStockInfo.stockData?.snapshot)}
          />
          <OptionsDataTable
            data={optionSearchDataWithStockInfo.options}
            isLoading={isLoading}
            error={error}
            strategyType={strategyType}
          />
        </div>
      )}
      {!isLoading && !error && optionSearchDataWithStockInfo?.options?.length === 0 && (
        <div className="text-center p-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">Enter a ticker symbol above to get started</p>
        </div>
      )}

      {/* Recommended Options Section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Recommended Options</h2>
        {(recommendedLoading || accountsLoading || isUserAccountDetailsLoading) && (
          <>
            <TextShimmer className='mb-2'>Looking at your portfolio...</TextShimmer>
            <Skeleton className="h-40 w-full mb-4" />
          </>
        )}
        {recommendedError && !recommendedLoading && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">{recommendedError}</div>
        )}
        {!recommendedLoading && !recommendedError && Object.keys(recommended).length === 0 && (
          <div className="text-gray-500 p-4">No recommended options found.</div>
        )}
        {!recommendedLoading && !recommendedError && Object.entries(recommended)
          .sort(([, a], [, b]) => {
            const portfolioValueA = (a.stockPositionData?.units || 0) * (a.stockPositionData?.price || 0);
            const portfolioValueB = (b.stockPositionData?.units || 0) * (b.stockPositionData?.price || 0);
            return portfolioValueB - portfolioValueA;
          })
          .map(([symbol, optionsWithStockData]) => (
            <div key={symbol} className="mb-8">
              <StockCard
                ticker={symbol}
                latestPrice={optionsWithStockData.stockData?.snapshot.LatestQuote.AskPrice || 0}
                changePrice={getChangeValueFromAlpacaSnapshot(optionsWithStockData.stockData?.snapshot)}
                changePercent={getChangePercentFromAlpacaSnapshot(optionsWithStockData.stockData?.snapshot)}
                quantity={optionsWithStockData.stockPositionData?.units || 0}
              />
              <OptionsDataTable
                data={optionsWithStockData.options}
                isLoading={false}
                error={null}
                strategyType={strategyType}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
