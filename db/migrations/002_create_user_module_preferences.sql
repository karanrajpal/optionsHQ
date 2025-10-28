-- Create user_module_preferences table to track module enable/disable per user
CREATE TABLE IF NOT EXISTS user_module_preferences (
    user_id TEXT PRIMARY KEY,
    portfolio_tracking_enabled BOOLEAN DEFAULT TRUE,
    options_discovery_enabled BOOLEAN DEFAULT TRUE,
    watchlist_enabled BOOLEAN DEFAULT TRUE,
    kalshi_monitoring_enabled BOOLEAN DEFAULT FALSE,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX idx_user_module_preferences_user_id ON user_module_preferences(user_id);

-- Create trigger to update modified_at timestamp
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
