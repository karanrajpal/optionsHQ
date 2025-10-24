import { NextRequest, NextResponse } from 'next/server';
import { createAlpacaOptionsService, AlpacaOptionsRequest } from '@/lib/alpaca';

/**
 * GET /api/alpaca/options
 * 
 * Fetch options contracts from Alpaca Options API
 * 
 * Query Parameters:
 * - underlying_symbols: Ticker symbol (e.g., "AAPL") - Required
 * - type: "call" or "put" - Optional
 * - status: "active" or "inactive" - Optional (default: "active")
 * - expiration_date_gte: Filter by expiration date >= this date (YYYY-MM-DD) - Optional
 * - expiration_date_lte: Filter by expiration date <= this date (YYYY-MM-DD) - Optional
 * - strike_price_gte: Filter by strike price >= this value - Optional
 * - strike_price_lte: Filter by strike price <= this value - Optional
 * - limit: Number of results to return (max 10000) - Optional
 * 
 * Example: /api/alpaca/options?underlying_symbols=AAPL&type=call&limit=50
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract and validate required parameters
    const underlying_symbols = searchParams.get('underlying_symbols');
    
    if (!underlying_symbols) {
      return NextResponse.json(
        { error: 'Missing required parameter: underlying_symbols' },
        { status: 400 }
      );
    }

    // Build request parameters
    const requestParams: AlpacaOptionsRequest = {
      underlying_symbols,
      status: (searchParams.get('status') as 'active' | 'inactive') || 'active',
    };

    // Add optional parameters if provided
    const type = searchParams.get('type');
    if (type && (type === 'call' || type === 'put')) {
      requestParams.type = type;
    }

    const expiration_date_gte = searchParams.get('expiration_date_gte');
    if (expiration_date_gte) {
      requestParams.expiration_date_gte = expiration_date_gte;
    }

    const expiration_date_lte = searchParams.get('expiration_date_lte');
    if (expiration_date_lte) {
      requestParams.expiration_date_lte = expiration_date_lte;
    }

    const strike_price_gte = searchParams.get('strike_price_gte');
    if (strike_price_gte) {
      requestParams.strike_price_gte = strike_price_gte;
    }

    const strike_price_lte = searchParams.get('strike_price_lte');
    if (strike_price_lte) {
      requestParams.strike_price_lte = strike_price_lte;
    }

    const limit = searchParams.get('limit');
    if (limit) {
      requestParams.limit = parseInt(limit, 10);
    }

    // Create service and fetch data
    const optionsService = createAlpacaOptionsService();
    const data = await optionsService.getOptionsWithSnapshots(requestParams);

    return NextResponse.json({
      success: true,
      count: data.length,
      options: data,
    });
  } catch (error) {
    console.error('Error in /api/alpaca/options:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}
