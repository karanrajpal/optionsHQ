"use client";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useUser } from "@stackframe/stack";
import { useUserDataAccounts } from "./UserDataAccountsProvider";

interface Watchlist {
  id: number;
  user_id: string;
  name: string;
  created_at: string;
  modified_at: string;
}

interface WatchlistItem {
  id: number;
  watchlist_id: number;
  ticker_symbol: string;
  added_at: string;
  name?: string | null;
  latest_price?: number | null;
  latest_quote_bid?: number | null;
  latest_quote_ask?: number | null;
  prev_close?: number | null;
  change?: number | null;
  change_percent?: number | null;
}

type WatchlistContextType = {
  watchlists: Watchlist[];
  selectedWatchlist: Watchlist | null;
  watchlistItems: WatchlistItem[];
  isLoading: boolean;
  setSelectedWatchlistId: (id: number | null) => void;
  createWatchlist: (name: string) => Promise<void>;
  updateWatchlist: (watchlistId: number, name: string) => Promise<void>;
  deleteWatchlist: (watchlistId: number) => Promise<void>;
  addWatchlistItem: (tickerSymbol: string) => Promise<void>;
  removeWatchlistItem: (tickerSymbol: string) => Promise<void>;
  refreshWatchlists: () => Promise<void>;
  refreshWatchlistItems: () => Promise<void>;
};

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider = ({ children }: { children: ReactNode }) => {
  const user = useUser();
  const { alpacaApiKey, alpacaApiSecret } = useUserDataAccounts();

  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<number | null>(null);
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const selectedWatchlist = useMemo(() => {
    return watchlists.find(w => w.id === selectedWatchlistId) || null;
  }, [watchlists, selectedWatchlistId]);

  const fetchWatchlists = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/watchlist?user_id=${user.id}`);
      const data = await response.json();
      setWatchlists(data);
      
      // Select the first watchlist by default if none is selected
      if (data.length > 0 && !selectedWatchlistId) {
        setSelectedWatchlistId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching watchlists:", error);
    }
  }, [user?.id, selectedWatchlistId]);

  const fetchWatchlistItems = useCallback(async () => {
    if (!selectedWatchlistId) {
      setWatchlistItems([]);
      return;
    }

    try {
      const headers: HeadersInit = {};
      if (alpacaApiKey && alpacaApiSecret) {
        headers['alpaca-api-key'] = alpacaApiKey;
        headers['alpaca-api-secret'] = alpacaApiSecret;
      }

      const response = await fetch(
        `/api/watchlist/items?watchlist_id=${selectedWatchlistId}`,
        { headers }
      );
      const data = await response.json();
      setWatchlistItems(data);
    } catch (error) {
      console.error("Error fetching watchlist items:", error);
    }
  }, [selectedWatchlistId, alpacaApiKey, alpacaApiSecret]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchWatchlists();
      setIsLoading(false);
    };
    
    if (user?.id) {
      loadData();
    }
  }, [user?.id, fetchWatchlists]);

  useEffect(() => {
    if (selectedWatchlistId) {
      fetchWatchlistItems();
    }
  }, [selectedWatchlistId, fetchWatchlistItems]);

  const createWatchlist = async (name: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, name }),
      });
      
      if (response.ok) {
        await fetchWatchlists();
      }
    } catch (error) {
      console.error("Error creating watchlist:", error);
      throw error;
    }
  };

  const updateWatchlist = async (watchlistId: number, name: string) => {
    try {
      const response = await fetch('/api/watchlist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watchlistId, name }),
      });
      
      if (response.ok) {
        await fetchWatchlists();
      }
    } catch (error) {
      console.error("Error updating watchlist:", error);
      throw error;
    }
  };

  const deleteWatchlist = async (watchlistId: number) => {
    try {
      const response = await fetch(`/api/watchlist?watchlist_id=${watchlistId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        if (selectedWatchlistId === watchlistId) {
          setSelectedWatchlistId(null);
        }
        await fetchWatchlists();
      }
    } catch (error) {
      console.error("Error deleting watchlist:", error);
      throw error;
    }
  };

  const addWatchlistItem = async (tickerSymbol: string) => {
    if (!selectedWatchlistId) return;

    try {
      const response = await fetch('/api/watchlist/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watchlistId: selectedWatchlistId, tickerSymbol }),
      });
      
      if (response.ok) {
        await fetchWatchlistItems();
      }
    } catch (error) {
      console.error("Error adding watchlist item:", error);
      throw error;
    }
  };

  const removeWatchlistItem = async (tickerSymbol: string) => {
    if (!selectedWatchlistId) return;

    try {
      const response = await fetch(
        `/api/watchlist/items?watchlist_id=${selectedWatchlistId}&ticker_symbol=${tickerSymbol}`,
        { method: 'DELETE' }
      );
      
      if (response.ok) {
        await fetchWatchlistItems();
      }
    } catch (error) {
      console.error("Error removing watchlist item:", error);
      throw error;
    }
  };

  const value = useMemo(
    () => ({
      watchlists,
      selectedWatchlist,
      watchlistItems,
      isLoading,
      setSelectedWatchlistId,
      createWatchlist,
      updateWatchlist,
      deleteWatchlist,
      addWatchlistItem,
      removeWatchlistItem,
      refreshWatchlists: fetchWatchlists,
      refreshWatchlistItems: fetchWatchlistItems,
    }),
    [
      watchlists,
      selectedWatchlist,
      watchlistItems,
      isLoading,
      fetchWatchlists,
      fetchWatchlistItems,
    ]
  );

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
};

export const useWatchlist = () => {
  const ctx = useContext(WatchlistContext);
  if (!ctx) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return ctx;
};
