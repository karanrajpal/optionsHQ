# Watchlist Feature

## Overview
The watchlist feature allows users to create and manage custom watchlists of stock ticker symbols. The feature integrates with the Alpaca API to display real-time stock information including latest prices, price changes, and trends.

## Database Schema

### Tables Created
- **watchlists**: Stores watchlist metadata (id, user_id, name, created_at, modified_at)
- **watchlist_items**: Stores individual ticker symbols in each watchlist (id, watchlist_id, ticker_symbol, added_at)

### Migration
Run the SQL migration located at `db/migrations/001_create_watchlist_tables.sql` to create the required tables in your database.

## API Endpoints

### Watchlist Management
- `GET /api/watchlist?user_id={userId}` - Get all watchlists for a user
- `POST /api/watchlist` - Create a new watchlist
  - Body: `{ userId: string, name: string }`
- `PUT /api/watchlist` - Update a watchlist name
  - Body: `{ watchlistId: number, name: string }`
- `DELETE /api/watchlist?watchlist_id={watchlistId}` - Delete a watchlist

### Watchlist Items
- `GET /api/watchlist/items?watchlist_id={watchlistId}` - Get all items in a watchlist
  - Optional headers: `alpaca-api-key`, `alpaca-api-secret` for enriched data
- `POST /api/watchlist/items` - Add a ticker to a watchlist
  - Body: `{ watchlistId: number, tickerSymbol: string }`
- `DELETE /api/watchlist/items?watchlist_id={watchlistId}&ticker_symbol={symbol}` - Remove a ticker from a watchlist

## Frontend Components

### Context Provider
The `WatchlistProvider` component wraps the application and provides watchlist state and operations to all child components via the `useWatchlist` hook.

### Watchlist Page
Located at `/watchlist`, this page provides:
- Watchlist selection and creation
- Stock search and addition
- Real-time price display with trends
- Stock removal from watchlist

## Features
- Create multiple watchlists per user
- Add/remove stocks by ticker symbol
- Real-time price data from Alpaca API
- Price change indicators (up/down trends)
- Percentage change display
- Empty and loading states
- Responsive design with dark mode support

## Usage

1. Navigate to `/watchlist` from the header menu
2. Create a new watchlist using the "New Watchlist" button
3. Add stocks by entering ticker symbols (e.g., AAPL, TSLA, MSFT)
4. View real-time prices and changes
5. Switch between watchlists using the watchlist selector buttons
6. Remove stocks using the trash icon

## Integration with Alpaca
The feature uses the Alpaca API to fetch:
- Latest trade prices
- Latest quote data (bid/ask)
- Daily bar data for change calculations
- Previous daily bar for comparison

If Alpaca credentials are not provided, the watchlist will still function but without real-time pricing data.
