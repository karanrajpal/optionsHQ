import { AlpacaOptionSnapshot } from '@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2';
import { getDaysToExpiration, extractStrikePriceFromContractSymbol } from '@/lib/formatters';
import { AugmentedAlpacaOptionSnapshot } from '@/app/discover/page';

export interface OptionsStrategy {
    augmentOptionsData(options: AlpacaOptionSnapshot[]): AugmentedAlpacaOptionSnapshot[];
    chooseGoodOptions(options: AugmentedAlpacaOptionSnapshot[]): AugmentedAlpacaOptionSnapshot[];
    strategyDefaultParams: {
        expiration_date_gte?: string;
        expiration_date_lte?: string;
        type?: 'call' | 'put';
    };
};
export class CoveredCallsOptionsStrategy implements OptionsStrategy {
    public augmentOptionsData(options: AlpacaOptionSnapshot[]): AugmentedAlpacaOptionSnapshot[] {
        return options.map(option => {
            const strikePrice = extractStrikePriceFromContractSymbol(option.Symbol);
            const expectedReturnPercentage = (option.LatestQuote.BidPrice / strikePrice) * 100;
            const daysToExpiration = getDaysToExpiration(option.Symbol);
            const expectedAnnualizedReturnPercentage = expectedReturnPercentage * 365 / (daysToExpiration);
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