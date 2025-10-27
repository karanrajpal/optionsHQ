import { Snaptrade } from "snaptrade-typescript-sdk";

export class SnaptradeService {
    private userId: string;
    private userSecret: string;
    private accountId?: string;
    private snaptrade: Snaptrade;

    constructor(userId: string, userSecret: string, accountId?: string) {
        this.userId = userId;
        this.userSecret = userSecret;
        this.accountId = accountId;
        this.snaptrade = new Snaptrade({
            clientId: process.env.NEXT_SNAPTRADE_CLIENT_ID as string,
            consumerKey: process.env.NEXT_SNAPTRADE_CONSUMER_KEY as string,
        });
    }

    public async getAccountHoldings() {
        return await this.snaptrade.accountInformation.getUserHoldings({
            accountId: this.accountId as string,
            userId: this.userId,
            userSecret: this.userSecret,
        });
    }

    public async getOptionHoldings() {
        return await this.snaptrade.options.listOptionHoldings({
            accountId: this.accountId as string,
            userId: this.userId,
            userSecret: this.userSecret,
        });
    }

    public async listUserAccounts() {
        return await this.snaptrade.accountInformation.listUserAccounts({
            userId: this.userId,
            userSecret: this.userSecret,
        });
    }
}