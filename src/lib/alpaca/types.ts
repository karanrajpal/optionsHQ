import { AlpacaBar, AlpacaSnapshot } from "@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2";

export type ManualAlpacaAsset = {
    id: string;
    class: string;
    exchange: string;
    symbol: string;
    name: string;
    cusip: string;
    status: string;
    tradable: boolean;
    marginable: boolean;
    shortable: boolean;
    easy_to_borrow: boolean;
    fractionable: boolean;
    attributes: string[];
};
export interface StockInfo {
	snapshot: AlpacaSnapshot;
    asset: ManualAlpacaAsset;
    historicalBars: AlpacaBar[];
}

