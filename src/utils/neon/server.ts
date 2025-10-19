import { neon } from "@neondatabase/serverless";

export class OptionsDatabase {
    private sql: any;

    constructor() {
        this.sql = neon(process.env.NEXT_PUBLIC_NEON_URL as string);
    }

    async getData() {
        const data = await this.sql`select * from options_transactions`;
        return data;
    }
}
