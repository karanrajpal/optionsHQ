import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useModulePreferences } from '@/context/ModulePreferencesProvider';
import { useWatchlist } from '@/context/WatchlistProvider';

export interface WatchlistItem {
    ticker_symbol: string;
    latest_price?: number;
    change_percent?: number;
}

export type OptionType = 'all' | 'call' | 'put';

interface OptionsSearchBarProps {
    ticker: string;
    onTickerChange: (ticker: string) => void;
    optionType: OptionType;
    onOptionTypeChange: (type: OptionType) => void;
    onSearch: () => void;
    isLoading?: boolean;
}

export function OptionsSearchBar({
    ticker,
    onTickerChange,
    optionType,
    onOptionTypeChange,
    onSearch,
    isLoading = false,
}: OptionsSearchBarProps) {
    // For quick picker pill click
    const [triggerSearchForTicker, setTriggerSearchForTicker] = useState<string | null>(null);

    const { preferences } = useModulePreferences();
    const { watchlistItems } = useWatchlist();

    // Handle Enter key
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    };

    // When a watchlist pill is clicked
    const handleWatchlistPillClick = (tickerSymbol: string) => {
        onTickerChange(tickerSymbol);
        setTriggerSearchForTicker(tickerSymbol);
    };

    // Auto-search when watchlist pill is clicked and ticker matches
    useEffect(() => {
        if (triggerSearchForTicker && ticker === triggerSearchForTicker) {
            setTriggerSearchForTicker(null);
            onSearch();
        }
    }, [ticker, triggerSearchForTicker, onSearch]);

    return (
        <div className='flex flex-col gap-2'>
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
                        onChange={(e) => onTickerChange(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="uppercase"
                    />
                </div>

                <div className="w-48 space-y-2">
                    <label htmlFor="optionType" className="text-sm font-medium">
                        Option Type
                    </label>
                    <Select value={optionType} onValueChange={(value: OptionType) => onOptionTypeChange(value)}>
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
                    onClick={onSearch}
                    disabled={isLoading}
                    className="px-8"
                >
                    {isLoading ? 'Loading...' : 'Get Options'}
                </Button>
            </div>

            {/* Watchlist Quick Search Pills */}
            {preferences?.watchlist_enabled && watchlistItems.length > 0 && (
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
            )}
        </div>
    );
}