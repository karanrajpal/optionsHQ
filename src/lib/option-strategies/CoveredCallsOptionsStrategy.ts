import { AlpacaOptionSnapshot } from '@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2';
import { getDaysToExpiration, extractStrikePriceFromContractSymbol } from '@/lib/formatters';
import { AugmentedAlpacaOptionSnapshot } from '@/app/discover/page';

export interface OptionsStrategy {
  augmentOptionsData(options: AlpacaOptionSnapshot[]): AugmentedAlpacaOptionSnapshot[];
  chooseGoodOptions(options: AugmentedAlpacaOptionSnapshot[]): AugmentedAlpacaOptionSnapshot[];
};
export class MakePremiumsOptionsStrategy implements OptionsStrategy {
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
      .filter(option => option.expectedReturnPercentage && option.expectedReturnPercentage >= 0.6 && option.expectedReturnPercentage <= 1.5)
      .sort((a, b) => (b.expectedReturnPercentage || 0) - (a.expectedReturnPercentage || 0));
  }
}