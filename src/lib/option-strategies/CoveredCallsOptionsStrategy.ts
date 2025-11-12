import { AlpacaOptionSnapshot } from '@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2';
import { getDaysToExpiration, extractStrikePriceFromContractSymbol } from '@/lib/formatters';
import { AugmentedAlpacaOptionSnapshot } from '@/app/discover/page';

export interface OptionsStrategy {
    augmentOptionsData(options: AlpacaOptionSnapshot[], stockPrice?: number): AugmentedAlpacaOptionSnapshot[];
    chooseGoodOptions(options: AugmentedAlpacaOptionSnapshot[]): AugmentedAlpacaOptionSnapshot[];
    strategyDefaultParams: {
        expiration_date_gte?: string;
        expiration_date_lte?: string;
        type?: 'call' | 'put';
    };
}
export class CoveredCallsOptionsStrategy implements OptionsStrategy {
    public augmentOptionsData(options: AlpacaOptionSnapshot[], stockPrice: number): AugmentedAlpacaOptionSnapshot[] {
        return options.map(option => {
            // Use stockPrice if provided, otherwise fallback to strikePrice
            const expectedReturnPercentage = (option.LatestQuote.BidPrice / stockPrice) * 100;
            console.log('Expected Return Percentage:', option.Symbol, expectedReturnPercentage, stockPrice, option.LatestQuote.BidPrice);
            const daysToExpiration = getDaysToExpiration(option.Symbol);
            const expectedAnnualizedReturnPercentage = daysToExpiration > 0 ? expectedReturnPercentage * 365 / daysToExpiration : 0;
            return {
                ...option,
                expectedReturnPercentage,
                expectedAnnualizedReturnPercentage,
            };
        });
    }

    public chooseGoodOptions(options: AugmentedAlpacaOptionSnapshot[]): AugmentedAlpacaOptionSnapshot[] {
        return options
            .filter(option => option.expectedAnnualizedReturnPercentage && option.expectedAnnualizedReturnPercentage >= 7.2 && option.expectedAnnualizedReturnPercentage <= 18)
            .sort((a, b) => (b.expectedAnnualizedReturnPercentage || 0) - (a.expectedAnnualizedReturnPercentage || 0));
    }

    private getDefaultParams(): {
        expiration_date_gte?: string;
        expiration_date_lte?: string;
        type?: 'call' | 'put';
    } {
        const today = new Date();
        const startDate = new Date();
        const endDate = new Date();

        startDate.setDate(today.getDate() + 35);
        endDate.setDate(today.getDate() + 42);
        return {
            expiration_date_gte: startDate.toISOString().split('T')[0],
            expiration_date_lte: endDate.toISOString().split('T')[0],
            type: 'call',
        };
    }

    public strategyDefaultParams = this.getDefaultParams();
}