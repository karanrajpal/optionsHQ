/**
 * Alpaca Options API Client
 * 
 * A scalable service for interacting with Alpaca's Options API.
 * This pattern can be replicated for other Alpaca services (trading, market data, etc.)
 */

import {
  AlpacaCredentials,
  AlpacaOptionsRequest,
  AlpacaOptionsChainResponse,
  AlpacaOptionContractWithSnapshot,
  AlpacaErrorResponse,
} from './types';

export class AlpacaOptionsService {
  private credentials: AlpacaCredentials;
  private baseUrl: string;

  constructor(credentials: AlpacaCredentials) {
    this.credentials = credentials;
    this.baseUrl = credentials.baseUrl || 'https://data.alpaca.markets';
  }

  /**
   * Get authentication headers for API requests
   */
  private getHeaders(): HeadersInit {
    return {
      'APCA-API-KEY-ID': this.credentials.apiKey,
      'APCA-API-SECRET-KEY': this.credentials.apiSecret,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Build query string from request parameters
   */
  private buildQueryString(params: AlpacaOptionsRequest): string {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    
    return queryParams.toString();
  }

  /**
   * Fetch options contracts (options chain) for a given underlying symbol
   * 
   * @param request - Filter parameters for options contracts
   * @returns Promise with options chain data
   */
  async getOptionsChain(
    request: AlpacaOptionsRequest
  ): Promise<AlpacaOptionsChainResponse> {
    const queryString = this.buildQueryString(request);
    const url = `${this.baseUrl}/v1beta1/options/contracts?${queryString}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error: AlpacaErrorResponse = await response.json();
        throw new Error(`Alpaca API Error: ${error.message || response.statusText}`);
      }

      const data: AlpacaOptionsChainResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching options chain from Alpaca:', error);
      throw error;
    }
  }

  /**
   * Fetch latest snapshots for specific option symbols
   * 
   * @param symbols - Array of option symbols
   * @returns Promise with snapshot data
   */
  async getOptionsSnapshots(
    symbols: string[]
  ): Promise<Record<string, AlpacaOptionContractWithSnapshot>> {
    const symbolsParam = symbols.join(',');
    const url = `${this.baseUrl}/v1beta1/options/snapshots/${symbolsParam}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error: AlpacaErrorResponse = await response.json();
        throw new Error(`Alpaca API Error: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      return data.snapshots || {};
    } catch (error) {
      console.error('Error fetching options snapshots from Alpaca:', error);
      throw error;
    }
  }

  /**
   * Get options contracts with their latest market data
   * This combines contract info with real-time snapshots
   * 
   * @param request - Filter parameters for options contracts
   * @returns Promise with enriched options data
   */
  async getOptionsWithSnapshots(
    request: AlpacaOptionsRequest
  ): Promise<AlpacaOptionContractWithSnapshot[]> {
    // First, get the options chain
    const chainData = await this.getOptionsChain(request);
    
    if (!chainData.option_contracts || chainData.option_contracts.length === 0) {
      return [];
    }

    // Get symbols for snapshot lookup
    const symbols = chainData.option_contracts.map(contract => contract.symbol);
    
    // Fetch snapshots for these contracts
    try {
      const snapshots = await this.getOptionsSnapshots(symbols);
      
      // Merge contract data with snapshots
      return chainData.option_contracts.map(contract => ({
        ...contract,
        snapshot: snapshots[contract.symbol]?.snapshot,
      }));
    } catch (error) {
      // If snapshots fail, still return contract data without snapshots
      console.warn('Failed to fetch snapshots, returning contracts without market data:', error);
      return chainData.option_contracts;
    }
  }
}

/**
 * Factory function to create an AlpacaOptionsService instance
 * This can be extended for other Alpaca services in the future
 */
export function createAlpacaOptionsService(): AlpacaOptionsService {
  const credentials: AlpacaCredentials = {
    apiKey: process.env.ALPACA_API_KEY || '',
    apiSecret: process.env.ALPACA_API_SECRET || '',
    baseUrl: process.env.ALPACA_BASE_URL,
  };

  if (!credentials.apiKey || !credentials.apiSecret) {
    throw new Error('Alpaca API credentials are not configured. Please set ALPACA_API_KEY and ALPACA_API_SECRET environment variables.');
  }

  return new AlpacaOptionsService(credentials);
}
