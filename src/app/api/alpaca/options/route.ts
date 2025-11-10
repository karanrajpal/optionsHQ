import { NextRequest, NextResponse } from 'next/server';
import { createAlpacaOptionsService } from '@/lib/alpaca';
import { GetOptionChainParams } from '@alpacahq/alpaca-trade-api/dist/resources/datav2/rest_v2';
import { CoveredCallsOptionsStrategy } from '@/lib/option-strategies/CoveredCallsOptionsStrategy';
import { OptionsWithStockData } from './bulk/route';
import { AlpacaCompositeService } from '@/lib/alpaca/composite-service';

/**
 * GET /api/alpaca/options
 * 
 * Fetch options contracts from Alpaca Options API
 * 
 * Query Parameters:
 * - root_symbol: Ticker symbol (e.g., "ORCL") - Required
 * - type: "call" or "put" - Optional
 * - status: "active" or "inactive" - Optional (default: "active")
 * - expiration_date_gte: Filter by expiration date >= this date (YYYY-MM-DD) - Optional
 * - expiration_date_lte: Filter by expiration date <= this date (YYYY-MM-DD) - Optional
 * - strike_price_gte: Filter by strike price >= this value - Optional
 * - strike_price_lte: Filter by strike price <= this value - Optional
 * - limit: Number of results to return (max 10000) - Optional
 *
 * Example: /api/alpaca/options?root_symbol=ORCL&type=call&limit=50
 * 
 * This endpoint returns options data and stock info of type OptionsWithStockData
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract and validate required parameters
    const root_symbol = searchParams.get('root_symbol');

    if (!root_symbol) {
      return NextResponse.json(
        { error: 'Missing required parameter: root_symbol' },
        { status: 400 }
      );
    }

    // Build request parameters
    const requestParams: GetOptionChainParams = {
      root_symbol,
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
      requestParams.strike_price_gte = Number(strike_price_gte);
    }

    const strike_price_lte = searchParams.get('strike_price_lte');
    if (strike_price_lte) {
      requestParams.strike_price_lte = Number(strike_price_lte);
    }

    const limit = searchParams.get('limit');
    if (limit) {
      requestParams.totalLimit = parseInt(limit, 10);
    }

    // Get strategyType from query
    const strategyType = searchParams.get('strategyType') || 'make-premiums';

    // Create service and fetch data
    const optionsService = createAlpacaOptionsService();
    const data = await optionsService.getOptionsChain(requestParams);

    // Augment data based on strategy
    let options = data;
    if (strategyType === 'covered-calls') {
      const strategy = new CoveredCallsOptionsStrategy();
      const augmentedData = strategy.augmentOptionsData(data);
      options = strategy.chooseGoodOptions(augmentedData);
    }
    // For 'leaps', just return the data as is (or add logic later)

    const alpacaCompositeService = new AlpacaCompositeService();
    const stockInfo = await alpacaCompositeService.getStockInfo(root_symbol);

    const result: OptionsWithStockData = {
      symbol: root_symbol,
      options,
      stockData: stockInfo
    };

    return NextResponse.json({result, success: true});
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
