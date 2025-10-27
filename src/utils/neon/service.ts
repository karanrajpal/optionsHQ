import { neon } from "@neondatabase/serverless";

export type SimpleWatchlistItem = {
    id: number;
    watchlist_id: number;
    ticker_symbol: string;
    added_at: string;
};
export class OptionsDatabase {
    private sql: any;

    constructor() {
        this.sql = neon(process.env.NEXT_PUBLIC_NEON_URL as string);
    }

    async getUserDataAccounts(userId: string) {
        const data = await this.sql`select * from user_data_accounts where user_id = ${userId}`;
        return data;
    }

    async saveSnaptradeCredentials(userId: string, snaptradeUserId: string, snaptradeUserSecret: string) {
        await this.sql`insert into user_data_accounts (user_id, snaptrade_user_id, snaptrade_user_secret) values (${userId}, ${snaptradeUserId}, ${snaptradeUserSecret})`;
    }

    async saveAlpacaCredentials(userId: string, alpacaApiKey: string, alpacaApiSecret: string) {
        await this.sql`insert into user_data_accounts (user_id, alpaca_api_key, alpaca_api_secret) values (${userId}, ${alpacaApiKey}, ${alpacaApiSecret})`;
    }

    // Watchlist methods
    async getWatchlists(userId: string) {
        const data = await this.sql`select * from watchlists where user_id = ${userId} order by modified_at desc`;
        return data;
    }

    async getWatchlist(watchlistId: number) {
        const data = await this.sql`select * from watchlists where id = ${watchlistId}`;
        return data[0];
    }

    async createWatchlist(userId: string, name: string) {
        const data = await this.sql`insert into watchlists (user_id, name, created_at, modified_at) values (${userId}, ${name}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) returning *`;
        return data[0];
    }

    async updateWatchlist(watchlistId: number, name: string) {
        const data = await this.sql`update watchlists set name = ${name}, modified_at = CURRENT_TIMESTAMP where id = ${watchlistId} returning *`;
        return data[0];
    }

    async deleteWatchlist(watchlistId: number) {
        await this.sql`delete from watchlists where id = ${watchlistId}`;
    }

    async getWatchlistItems(watchlistId: number): Promise<SimpleWatchlistItem[]> {
        const data = await this.sql`select * from watchlist_items where watchlist_id = ${watchlistId} order by added_at desc`;
        return data;
    }

    async addWatchlistItem(watchlistId: number, tickerSymbol: string) {
        const data = await this.sql`insert into watchlist_items (watchlist_id, ticker_symbol, added_at) values (${watchlistId}, ${tickerSymbol.toUpperCase()}, CURRENT_TIMESTAMP) on conflict (watchlist_id, ticker_symbol) do nothing returning *`;
        await this.sql`update watchlists set modified_at = CURRENT_TIMESTAMP where id = ${watchlistId}`;
        return data[0];
    }

    async removeWatchlistItem(watchlistId: number, tickerSymbol: string) {
        await this.sql`delete from watchlist_items where watchlist_id = ${watchlistId} and ticker_symbol = ${tickerSymbol.toUpperCase()}`;
        await this.sql`update watchlists set modified_at = CURRENT_TIMESTAMP where id = ${watchlistId}`;
    }
}
