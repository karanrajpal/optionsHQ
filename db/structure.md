# Database Structure

## Tables

### user_data_accounts
Stores user authentication and API credentials.

| Column | Type | Description |
|--------|------|-------------|
| user_id | VARCHAR | Primary key, user identifier |
| snaptrade_user_id | VARCHAR | SnapTrade user ID |
| snaptrade_user_secret | VARCHAR | SnapTrade user secret |
| alpaca_api_key | VARCHAR | Alpaca API key |
| alpaca_api_secret | VARCHAR | Alpaca API secret |

### watchlists
Stores watchlist metadata for users.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key, auto-incrementing |
| user_id | VARCHAR | Foreign key to user_data_accounts(user_id) |
| name | VARCHAR(255) | Watchlist name |
| created_at | TIMESTAMP | Timestamp when the watchlist was created |
| modified_at | TIMESTAMP | Timestamp when the watchlist was last modified |

### watchlist_items
Stores individual ticker symbols in watchlists.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key, auto-incrementing |
| watchlist_id | INTEGER | Foreign key to watchlists(id) |
| ticker_symbol | VARCHAR(10) | Stock ticker symbol (e.g., AAPL, TSLA) |
| added_at | TIMESTAMP | Timestamp when the ticker was added |

## SQL Migrations

### Create watchlists table
```sql
CREATE TABLE IF NOT EXISTS watchlists (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_data_accounts(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_watchlists_user_id ON watchlists(user_id);
```

### Create watchlist_items table
```sql
CREATE TABLE IF NOT EXISTS watchlist_items (
    id SERIAL PRIMARY KEY,
    watchlist_id INTEGER NOT NULL,
    ticker_symbol VARCHAR(10) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (watchlist_id) REFERENCES watchlists(id) ON DELETE CASCADE,
    UNIQUE(watchlist_id, ticker_symbol)
);

CREATE INDEX idx_watchlist_items_watchlist_id ON watchlist_items(watchlist_id);
```
