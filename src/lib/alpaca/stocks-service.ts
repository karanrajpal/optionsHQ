/**
 * Alpaca Stocks API Client
 * 
 * Service for interacting with Alpaca's Stock Market Data API.
 */

import Alpaca from '@alpacahq/alpaca-trade-api';
import { ManualAlpacaAsset } from './types';

export class AlpacaStocksService {
  private alpaca: Alpaca;

  constructor(apiKey?: string, apiSecret?: string) {
    this.alpaca = new Alpaca({
      keyId: apiKey || process.env.ALPACA_API_KEY || '',
      secretKey: apiSecret || process.env.ALPACA_API_SECRET || '',
      paper: !!process.env.ALPACA_BASE_URL?.includes('paper'),
      baseUrl: process.env.ALPACA_BASE_URL,
    });
  }

  /**
   * Get snapshot data for a single stock symbol
   * @param symbol - Stock ticker symbol (e.g., "ORCL")
   * @returns Promise with snapshot data including latest trade, quote, and bars
   */
  async getSnapshot(symbol: string) {
    try {
      return await this.alpaca.getSnapshot(symbol);
    } catch (error) {
      console.error(`Error fetching snapshot for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Get snapshot data for multiple stock symbols
   * @param symbols - Array of stock ticker symbols
   * @returns Promise with array of snapshot data
   */
  async getSnapshots(symbols: string[]) {
    try {
      return await this.alpaca.getSnapshots(symbols);
    } catch (error) {
      console.error(`Error fetching snapshots for symbols:`, error);
      throw error;
    }
  }

  /**
   * Get asset information for a symbol
   * @param symbol - Stock ticker symbol
   * @returns Promise with asset information
   */
  async getAsset(symbol: string): Promise<ManualAlpacaAsset> {
    try {
      return await this.alpaca.getAsset(symbol);
    } catch (error) {
      console.error(`Error fetching asset for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Search for assets matching criteria
   * @param options - Search options
   * @returns Promise with array of matching assets
   */
  async searchAssets(options?: { status?: string; asset_class?: string }): Promise<ManualAlpacaAsset[]> {
    try {
      return await this.alpaca.getAssets(options);
    } catch (error) {
      console.error(`Error searching assets:`, error);
      throw error;
    }
  }

  /**
   * Get historical bars for a symbol
   * @param symbol - Stock ticker symbol
   * @param timeframe - Timeframe for bars (e.g., "1Min", "5Min", "1Day")
   * @param start - ISO string for start time
   * @param end - ISO string for end time
   * @returns Promise with array of bar data
   */
  async getBars(symbol: string, timeframe: string, start?: string, end?: string) {
    try {
      const bars = this.alpaca.getBarsV2(symbol, {
        timeframe,
        start,
        end,
        feed: 'iex',
      });
      const barArray = [];
      for await (const bar of bars) {
        barArray.push(bar);
      }
      return barArray;
    } catch (error) {
      console.error(`Error fetching bars for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Get bars for multiple symbols
   * @param symbols - Array of stock ticker symbols
   * @param timeframe - Timeframe for bars
   * @param start - ISO string for start time
   * @param end - ISO string for end time
   * @returns Promise with map of symbol to array of bar data
   * 
   * Uses the getMultiBarsV2 method to fetch bars for multiple symbols in a single call.
   */
  async getMultiBars(symbols: string[], timeframe: string, start?: string, end?: string) {
    try {
      const barsMap = await this.alpaca.getMultiBarsV2(symbols, {
        timeframe,
        start,
        end,
        feed: 'iex',
      });
      // Converting barsMap from Map to a regular object for easier consumption
      return Object.fromEntries(barsMap);
    } catch (error) {
      console.error(`Error fetching multi bars for symbols:`, error);
      throw error;
    }
  }


  /**
   * Get news articles for multiple symbols
   * @param symbols - Array of stock ticker symbols
   * @param options - Additional options like start and end dates
   * @returns Promise with news articles
   */
  async getNews(symbols: string[], options?: { start?: string; end?: string; limit?: number }) {
    try {
      return await this.alpaca.getNews({ symbols, ...options });
    } catch (error) {
      console.error(`Error fetching news for symbols:`, error);
      throw error;
    }
  }
}

/**
 * Factory function to create an AlpacaStocksService instance
 */
export function createAlpacaStocksService(apiKey?: string, apiSecret?: string): AlpacaStocksService {
  return new AlpacaStocksService(apiKey, apiSecret);
}
