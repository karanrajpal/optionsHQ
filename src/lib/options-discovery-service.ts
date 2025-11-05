import { createAlpacaOptionsService } from "@/lib/alpaca";
import { GetOptionChainParams } from "@alpacahq/alpaca-trade-api/dist/resources/datav2/rest_v2";
import { MakePremiumsOptionsStrategy } from "@/lib/option-strategies/CoveredCallsOptionsStrategy";

export class OptionsDiscoveryService {
    async getOptionsChainWithAugmentedInformation(
        requestParams: GetOptionChainParams,
        strategyType: string = "make-premiums"
    ) {
        const optionsService = createAlpacaOptionsService();
        let data;

        if (strategyType === "make-premiums") {
            const strategy = new MakePremiumsOptionsStrategy();
            const requestParamsWithDefaults = {
                ...strategy.strategyDefaultParams,
                ...requestParams,
            };
            data = await optionsService.getOptionsChain(requestParamsWithDefaults);
            const augmentedData = strategy.augmentOptionsData(data);
            return strategy.chooseGoodOptions(augmentedData);
        }
        // For 'leaps' or other strategies, just return the data as is (or add logic later)
        else {
            data = await optionsService.getOptionsChain(requestParams);
        }
        return data;
    }
}
