/**
 * Alpaca Options API Client
 * 
 * A scalable service for interacting with Alpaca's Options API.
 * This pattern can be replicated for other Alpaca services (trading, market data, etc.)
 */

import Alpaca from '@alpacahq/alpaca-trade-api';
import { GetOptionChainParams } from '@alpacahq/alpaca-trade-api/dist/resources/datav2/rest_v2';

export class AlpacaOptionsService {
  private alpaca: Alpaca;

  constructor() {
    this.alpaca = new Alpaca({
      keyId: process.env.ALPACA_API_KEY || '',
      secretKey: process.env.ALPACA_API_SECRET || '',
      paper: !!process.env.ALPACA_BASE_URL?.includes('paper'),
      baseUrl: process.env.ALPACA_BASE_URL,
    });
  }



  /**
   * Fetch options contracts (options chain) for a given underlying symbol
   * @param request - Filter parameters for options contracts
   * @returns Promise with options chain data
   */
  async getOptionsChain(request: GetOptionChainParams) {
    // root_symbol is required
    if (!request.root_symbol) {
      throw new Error('root_symbol is required');
    }
    return this.alpaca.getOptionChain(request.root_symbol, request);
  }

  /**
   * Fetch latest snapshots for specific option symbols
   * @param symbols - Array of option symbols
   * @returns Promise with snapshot data
   */
  async getOptionsSnapshots(symbols: string[]) {
    return this.alpaca.getOptionSnapshots(symbols);
  }
}

/**
 * Factory function to create an AlpacaOptionsService instance
 */
export function createAlpacaOptionsService(): AlpacaOptionsService {
  return new AlpacaOptionsService();
}
