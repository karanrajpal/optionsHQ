import { neon } from "@neondatabase/serverless";

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
}
