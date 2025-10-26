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
}
