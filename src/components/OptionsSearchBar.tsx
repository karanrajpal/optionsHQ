import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useModulePreferences } from '@/context/ModulePreferencesProvider';
import { useWatchlist } from '@/context/WatchlistProvider';
import { Skeleton } from './ui/skeleton';

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
    disableOptionType?: boolean;
}

export function OptionsSearchBar({
    ticker,
    onTickerChange,
    optionType,
    onOptionTypeChange,
    onSearch,
    isLoading = false,
    disableOptionType = false,
}: OptionsSearchBarProps) {
    // For quick picker pill click
    const [triggerSearchForTicker, setTriggerSearchForTicker] = useState<string | null>(null);

    const { preferences } = useModulePreferences();
    const { watchlistItems, isWatchListItemsLoading } = useWatchlist();

    // Handle Enter key
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    };

    // Watchlist quick search pill click
    const handleWatchlistPillClick = (symbol: string) => {
        onTickerChange(symbol);
        setTriggerSearchForTicker(symbol);
    };

    // If a pill was clicked, trigger search
    useEffect(() => {
        if (triggerSearchForTicker) {
            onSearch();
            setTriggerSearchForTicker(null);
        }
    }, [triggerSearchForTicker, onSearch]);

    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col md:flex-row md:items-end gap-2 w-full">
                <div className="flex-1">
                    <Input
                        id="ticker"
                        type="text"
                        placeholder="Enter any ticker symbol"
                        value={ticker}
                        onChange={e => onTickerChange(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="w-full"
                        disabled={isLoading}
                    />
                </div>
                <div className="w-32">
                    <Select value={optionType} onValueChange={onOptionTypeChange} disabled={isLoading || disableOptionType}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="call">Call</SelectItem>
                            <SelectItem value="put">Put</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={onSearch} disabled={isLoading} className="w-32">
                    {isLoading ? 'Loading...' : 'Search'}
                </Button>
            </div>
            
            {/* Watchlist Quick Search Pills */}
            {preferences?.watchlist_enabled && isWatchListItemsLoading && (
                <Skeleton className="h-8 w-56" />
            )}
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