# Database Structure

## Tables

### neon_auth.users_sync
--------------------------------------------------------------------------
| Column Name     | Data Type        | Description                       |
|-----------------|------------------|-----------------------------------|
| id              | TEXT             | Primary key, unique user ID       |
| name            | VARCHAR(255)     | User's full name                  |
| email           | VARCHAR(255)     | User's email address              |
| created_at      | TIMESTAMP        | Timestamp of user creation        |
| updated_at      | TIMESTAMP        | Timestamp of last update          |
| deleted_at      | TIMESTAMP        | Timestamp of deletion (nullable)  |
--------------------------------------------------------------------------

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
| user_id | TEXT | Foreign key to neon_auth.users_sync(id) |
| name | VARCHAR(255) | Watchlist name |
| created_at | TIMESTAMP | Timestamp when the watchlist was created |
| modified_at | TIMESTAMP | Timestamp when the watchlist was last modified |

### watchlist_items
Stores individual ticker symbols in watchlists.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key, auto-incrementing |
| watchlist_id | INTEGER | Foreign key to watchlists(id) |
| ticker_symbol | VARCHAR(10) | Stock ticker symbol (e.g., ORCL, TSLA) |
| added_at | TIMESTAMP | Timestamp when the ticker was added |

### user_module_preferences
Stores module enable/disable preferences for each user.

| Column | Type | Description |
|--------|------|-------------|
| user_id | TEXT | Primary key, foreign key to neon_auth.users_sync(id) |
| portfolio_tracking_enabled | BOOLEAN | Enable/disable portfolio tracking module (stocks, options, performance) |
| options_discovery_enabled | BOOLEAN | Enable/disable options discovery module |
| watchlist_enabled | BOOLEAN | Enable/disable watchlist module |
| kalshi_monitoring_enabled | BOOLEAN | Enable/disable Kalshi monitoring module |
| modified_at | TIMESTAMP | Timestamp when preferences were last modified |

## SQL Migrations

### Create watchlists table
```sql
CREATE TABLE IF NOT EXISTS watchlists (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE
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

### Create user_module_preferences table
```sql
CREATE TABLE IF NOT EXISTS user_module_preferences (
    user_id TEXT PRIMARY KEY,
    portfolio_tracking_enabled BOOLEAN DEFAULT TRUE,
    options_discovery_enabled BOOLEAN DEFAULT TRUE,
    watchlist_enabled BOOLEAN DEFAULT TRUE,
    kalshi_monitoring_enabled BOOLEAN DEFAULT FALSE,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_module_preferences_user_id ON user_module_preferences(user_id);

CREATE OR REPLACE FUNCTION update_user_module_preferences_modified_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_module_preferences_modified_at
BEFORE UPDATE ON user_module_preferences
FOR EACH ROW
EXECUTE FUNCTION update_user_module_preferences_modified_at();
```
