
import { OptionTransaction } from "@/interfaces";

export class SnapTrade {
    private userId: string;
    private userSecret: string;
    private baseUrl: string = "https://api.snaptrade.com/api/v1";

    constructor() {
        this.userId = process.env.SNAPTRADE_USER_ID!;
        this.userSecret = process.env.SNAPTRADE_USER_SECRET!;
    }

    async getTransactions(): Promise<OptionTransaction[]> {
        const url = `${this.baseUrl}/users/${this.userId}/transactions`;
        
        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${this.userSecret}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch transactions from SnapTrade");
        }

        const data = await response.json();
        return data;
    }
}
