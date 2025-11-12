import { createAlpacaOptionsService } from "@/lib/alpaca";
import { GetOptionChainParams } from "@alpacahq/alpaca-trade-api/dist/resources/datav2/rest_v2";
import { CoveredCallsOptionsStrategy } from "@/lib/option-strategies/CoveredCallsOptionsStrategy";

export class OptionsDiscoveryService {
    async getOptionsChainWithAugmentedInformation(
        requestParams: GetOptionChainParams,
        strategyType: string = "covered-calls",
        stockPrice: number
    ) {
        const optionsService = createAlpacaOptionsService();
        let data;

        if (strategyType === "covered-calls") {
            const strategy = new CoveredCallsOptionsStrategy();
            const requestParamsWithDefaults = {
                ...strategy.strategyDefaultParams,
                ...requestParams,
            };
            data = await optionsService.getOptionsChain(requestParamsWithDefaults);
            const augmentedData = strategy.augmentOptionsData(data, stockPrice);
            return strategy.chooseGoodOptions(augmentedData);
        }
        // For 'leaps' or other strategies, just return the data as is (or add logic later)
        else {
            data = await optionsService.getOptionsChain(requestParams);
        }
        return data;
    }
}
