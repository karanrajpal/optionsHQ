"use client";

import { useState } from "react";
import { useWatchlist } from "@/context/WatchlistProvider";
import { Button } from "@/components/ui/button";
import { LuPlus, LuTrash2, LuTrendingUp, LuTrendingDown } from "react-icons/lu";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export default function WatchlistPage() {
    const {
        watchlists,
        selectedWatchlist,
        watchlistItems,
        isLoading,
        isWatchListItemsLoading,
        setSelectedWatchlistId,
        createWatchlist,
        addWatchlistItem,
        removeWatchlistItem,
    } = useWatchlist();

    const [newWatchlistName, setNewWatchlistName] = useState("");
    const [showNewWatchlistInput, setShowNewWatchlistInput] = useState(false);
    const [newTickerSymbol, setNewTickerSymbol] = useState("");
    const [isAddingTicker, setIsAddingTicker] = useState(false);

    const handleCreateWatchlist = async () => {
        if (!newWatchlistName.trim()) return;
        
        try {
            await createWatchlist(newWatchlistName);
            setNewWatchlistName("");
            setShowNewWatchlistInput(false);
        } catch (error) {
            console.error("Error creating watchlist:", error);
        }
    };

    const handleAddTicker = async () => {
        if (!newTickerSymbol.trim()) return;
        
        setIsAddingTicker(true);
        try {
            await addWatchlistItem(newTickerSymbol.toUpperCase());
            setNewTickerSymbol("");
        } catch (error) {
            console.error("Error adding ticker:", error);
        } finally {
            setIsAddingTicker(false);
        }
    };

    const handleRemoveTicker = async (tickerSymbol: string) => {
        try {
            await removeWatchlistItem(tickerSymbol);
        } catch (error) {
            console.error("Error removing ticker:", error);
        }
    };

    const getTickerLogoUrl = (symbol: string) => {
        return `https://logo.clearbit.com/${symbol.toLowerCase()}.com`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-gray-600 dark:text-gray-400">Loading watchlists...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Watchlist</h1>
                    <p className="text-gray-600 dark:text-gray-400">Track your favorite stocks</p>
                </div>

                {/* Watchlist selector */}
                <div className="mb-6 flex items-center gap-4">
                    <div className="flex gap-2 flex-wrap">
                        {watchlists.map((watchlist) => (
                            <Button
                                key={watchlist.id}
                                variant={selectedWatchlist?.id === watchlist.id ? "default" : "outline"}
                                onClick={() => setSelectedWatchlistId(watchlist.id)}
                            >
                                {watchlist.name}
                            </Button>
                        ))}
                        {!showNewWatchlistInput && (
                            <Button
                                variant="outline"
                                onClick={() => setShowNewWatchlistInput(true)}
                            >
                                <LuPlus className="mr-2" />
                                New Watchlist
                            </Button>
                        )}
                    </div>
                    {showNewWatchlistInput && (
                        <div className="flex gap-2">
                            <Input
                                placeholder="Watchlist name"
                                value={newWatchlistName}
                                onChange={(e) => setNewWatchlistName(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleCreateWatchlist()}
                            />
                            <Button onClick={handleCreateWatchlist}>Create</Button>
                            <Button variant="outline" onClick={() => {
                                setShowNewWatchlistInput(false);
                                setNewWatchlistName("");
                            }}>
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>

                {/* Add ticker section */}
                {selectedWatchlist && (
                    <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter ticker symbol (e.g., ORCL)"
                                value={newTickerSymbol}
                                onChange={(e) => setNewTickerSymbol(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleAddTicker()}
                                className="flex-1"
                            />
                            <Button onClick={handleAddTicker} disabled={isAddingTicker}>
                                <LuPlus className="mr-2" />
                                {isAddingTicker ? "Adding..." : "Add Stock"}
                            </Button>
                        </div>
                    </div>
                )}

                {isWatchListItemsLoading && (
                    <div className="flex justify-center">
                        <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                )}

                {/* Watchlist items */}
                {!selectedWatchlist ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center shadow-sm">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {watchlists.length === 0
                                ? "Create your first watchlist to start tracking stocks"
                                : "Select a watchlist to view stocks"}
                        </p>
                        {watchlists.length === 0 && (
                            <Button onClick={() => setShowNewWatchlistInput(true)}>
                                <LuPlus className="mr-2" />
                                Create Watchlist
                            </Button>
                        )}
                    </div>
                ) : watchlistItems.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center shadow-sm">
                        <p className="text-gray-600 dark:text-gray-400">
                            No stocks in this watchlist. Add some to get started!
                        </p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Change
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Change %
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {watchlistItems.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 mr-3">
                                                    <div
                                                        className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm font-semibold text-gray-600 dark:text-gray-300"
                                                        title={item.ticker_symbol}
                                                    >
                                                        <Image
                                                            src={`https://raw.githubusercontent.com/nvstly/icons/refs/heads/main/ticker_icons/${item.ticker_symbol}.png`}
                                                            alt={item.ticker_symbol}
                                                            width={32}
                                                            height={32}
                                                            className="rounded-full"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {item.ticker_symbol}
                                                    </div>
                                                    {item.name && (
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {item.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                                            {item.latest_price !== null && item.latest_price !== undefined
                                                ? `$${item.latest_price.toFixed(2)}`
                                                : "—"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            {item.change !== null && item.change !== undefined ? (
                                                <span
                                                    className={
                                                        item.change >= 0
                                                            ? "text-green-600 dark:text-green-400"
                                                            : "text-red-600 dark:text-red-400"
                                                    }
                                                >
                                                    {item.change >= 0 ? "+" : ""}
                                                    {item.change.toFixed(2)}
                                                </span>
                                            ) : (
                                                "—"
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            {item.change_percent !== null && item.change_percent !== undefined ? (
                                                <div className="flex items-center justify-end gap-1">
                                                    {item.change_percent >= 0 ? (
                                                        <LuTrendingUp className="text-green-600 dark:text-green-400" />
                                                    ) : (
                                                        <LuTrendingDown className="text-red-600 dark:text-red-400" />
                                                    )}
                                                    <span
                                                        className={
                                                            item.change_percent >= 0
                                                                ? "text-green-600 dark:text-green-400"
                                                                : "text-red-600 dark:text-red-400"
                                                        }
                                                    >
                                                        {item.change_percent >= 0 ? "+" : ""}
                                                        {item.change_percent.toFixed(2)}%
                                                    </span>
                                                </div>
                                            ) : (
                                                "—"
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveTicker(item.ticker_symbol)}
                                            >
                                                <LuTrash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
