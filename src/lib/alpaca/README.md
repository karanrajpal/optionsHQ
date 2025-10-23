# Alpaca API Integration

This directory contains the TypeScript-friendly Alpaca API integration for OptionsHQ.

## Structure

```
src/lib/alpaca/
├── index.ts              # Main export file
├── types.ts              # TypeScript interfaces and types
├── options-service.ts    # Options API service
└── README.md            # This file
```

## Usage

### Environment Variables

Add the following to your `.env.local` file:

```env
ALPACA_API_KEY=your_alpaca_api_key
ALPACA_API_SECRET=your_alpaca_api_secret
# Optional: for paper trading
ALPACA_BASE_URL=https://paper-api.alpaca.markets
```

### Options Service

```typescript
import { createAlpacaOptionsService } from '@/lib/alpaca';

// Create service instance
const optionsService = createAlpacaOptionsService();

// Fetch options chain
const data = await optionsService.getOptionsChain({
  underlying_symbols: 'AAPL',
  type: 'call',
  limit: 50
});

// Fetch options with real-time snapshots
const enrichedData = await optionsService.getOptionsWithSnapshots({
  underlying_symbols: 'TSLA',
  expiration_date_gte: '2025-01-01',
  expiration_date_lte: '2025-03-31'
});
```

## Scalability Pattern

This integration follows a service-oriented pattern that can be replicated for other Alpaca APIs:

1. **Types First**: Define TypeScript interfaces in `types.ts`
2. **Service Class**: Create a service class with methods for API operations
3. **Factory Function**: Export a factory function that handles credential loading
4. **API Routes**: Create Next.js API routes that use the service
5. **UI Components**: Build React components that consume the API routes

### Adding New Alpaca Services

To add support for other Alpaca APIs (Trading, Market Data, etc.):

1. Create new type definitions in `types.ts` or a new file
2. Create a new service class (e.g., `AlpacaTradingService`)
3. Add a factory function for the service
4. Export from `index.ts`
5. Create corresponding API routes
6. Build UI components as needed

Example structure for trading API:

```typescript
// types.ts
export interface AlpacaOrder { /* ... */ }

// trading-service.ts
export class AlpacaTradingService {
  async placeOrder(order: AlpacaOrder) { /* ... */ }
}

export function createAlpacaTradingService() { /* ... */ }

// index.ts
export * from './trading-service';
```

## API Endpoints

### GET /api/alpaca/options

Fetch options contracts from Alpaca.

**Query Parameters:**
- `underlying_symbols` (required): Ticker symbol
- `type`: "call" or "put"
- `status`: "active" or "inactive"
- `expiration_date_gte`: Min expiration date (YYYY-MM-DD)
- `expiration_date_lte`: Max expiration date (YYYY-MM-DD)
- `strike_price_gte`: Min strike price
- `strike_price_lte`: Max strike price
- `limit`: Number of results (max 10000)

**Example:**
```
/api/alpaca/options?underlying_symbols=AAPL&type=call&limit=50
```

## Resources

- [Alpaca Options API Documentation](https://docs.alpaca.markets/docs/options-trading)
- [Alpaca API Keys](https://app.alpaca.markets/paper/dashboard/overview)
