/**
 * Alpaca Options API Types
 * Based on Alpaca's Options API documentation
 */

export interface AlpacaOptionContract {
  id: string;
  symbol: string;
  name: string;
  status: string;
  tradable: boolean;
  expiration_date: string;
  root_symbol: string;
  underlying_symbol: string;
  underlying_asset_id: string;
  type: 'call' | 'put';
  style: 'american' | 'european';
  strike_price: string;
  multiplier: string;
  size: string;
  open_interest: string;
  open_interest_date: string;
  close_price: string;
  close_price_date: string;
}

export interface AlpacaOptionsSnapshot {
  latestTrade?: {
    t: string; // timestamp
    x: string; // exchange
    p: number; // price
    s: number; // size
    c: string[]; // conditions
  };
  latestQuote?: {
    t: string; // timestamp
    ax: string; // ask exchange
    ap: number; // ask price
    as: number; // ask size
    bx: string; // bid exchange
    bp: number; // bid price
    bs: number; // bid size
    c: string[]; // conditions
  };
  impliedVolatility?: number;
  greeks?: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
    rho: number;
  };
}

export interface AlpacaOptionContractWithSnapshot extends AlpacaOptionContract {
  snapshot?: AlpacaOptionsSnapshot;
}

export interface AlpacaOptionsChainResponse {
  option_contracts: AlpacaOptionContract[];
  next_page_token?: string;
}

export interface AlpacaOptionsRequest {
  underlying_symbols?: string;
  status?: 'active' | 'inactive';
  expiration_date?: string;
  expiration_date_gte?: string;
  expiration_date_lte?: string;
  root_symbol?: string;
  type?: 'call' | 'put';
  strike_price_gte?: string;
  strike_price_lte?: string;
  page_token?: string;
  limit?: number;
}

export interface AlpacaCredentials {
  apiKey: string;
  apiSecret: string;
  baseUrl?: string;
}

export interface AlpacaErrorResponse {
  code: number;
  message: string;
}
