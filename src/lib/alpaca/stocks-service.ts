/**
 * Alpaca Stocks API Client
 * 
 * Service for interacting with Alpaca's Stock Market Data API.
 */

import Alpaca from '@alpacahq/alpaca-trade-api';

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
  async getAsset(symbol: string) {
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
  async searchAssets(options?: { status?: string; asset_class?: string }) {
    try {
      return await this.alpaca.getAssets(options);
    } catch (error) {
      console.error(`Error searching assets:`, error);
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
