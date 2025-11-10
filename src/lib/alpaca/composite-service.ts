/**
 * Composite service for Alpaca API
 * Combines multiple Alpaca service calls into higher-level operations
 */

import { AlpacaStocksService } from './stocks-service';
import { AlpacaOptionsService } from './options-service';
import { StockInfo } from './types';

export class AlpacaCompositeService {
  private stocksService: AlpacaStocksService;
  private optionsService: AlpacaOptionsService;

  constructor() {
    this.stocksService = new AlpacaStocksService();
    this.optionsService = new AlpacaOptionsService();
  }

  /**
   * Fetch StockInfo for a given stock symbol
   * @param symbol - Stock ticker symbol
   * @returns Promise with StockInfo
   */
  async getStockInfo(symbol: string): Promise<StockInfo> {
    const asset = await this.stocksService.getAsset(symbol);
    const snapshot = await this.stocksService.getSnapshot(symbol);
    const historicalBars = await this.stocksService.getBars(symbol, '1Day', '2023-01-01', new Date().toISOString());
    return {
      asset,
      snapshot,
      historicalBars,
    };
  }

  async getStockInfos(symbols: string[]): Promise<Record<string, StockInfo>> {
    const stockInfos: Record<string, StockInfo> = {};
    const snapshots = await this.stocksService.getSnapshots(symbols);
    const multiBars = await this.stocksService.getMultiBars(symbols, '1Day', '2023-01-01', new Date().toISOString());

    for (const symbol of symbols) {
      const asset = await this.stocksService.getAsset(symbol);
      const snapshot = snapshots.find(s => (s as any).symbol === symbol);
      if (!snapshot) {
        console.warn(`Snapshot not found for symbol: ${symbol}`);
        continue;
      }
      const historicalBars = multiBars[symbol] || [];
      stockInfos[symbol] = {
        asset,
        snapshot,
        historicalBars,
      };
    }

    return stockInfos;
  }
}