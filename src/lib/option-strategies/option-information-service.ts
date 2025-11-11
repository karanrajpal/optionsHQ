/**
 * Converts Snaptrade Options Data to OptionsWithStrategyInformation format.
 */

import { AccountHoldingsAccount, OptionsPosition } from "snaptrade-typescript-sdk";

export type SupportedStrategy = 'covered-calls' | 'cash-secured-put' | 'leap' | 'bull-put-credit-spread' | 'bear-call-credit-spread' | 'unknown';
export type OptionsWithStrategyInformation = OptionsPosition & {
    strategyType: SupportedStrategy;
    id?: string; // This id is used to group multi-leg options together
};
export class OptionInformationService {
    /**
     * Figure out strategy type based on other options held for the same underlying stock.
     * Returns OptionsWithStrategyInformation[] object.
     */
    public static categorizeOptionsByStrategy(options: OptionsPosition[], stockHoldings: AccountHoldingsAccount): OptionsWithStrategyInformation[] {
        const categorizedOptions: OptionsWithStrategyInformation[] = [];
        const optionsByUnderlying: { [underlyingSymbol: string]: OptionsPosition[] } = {};

        // Group options by their underlying stock symbol
        options.forEach(option => {
            const underlyingSymbol = option.symbol?.option_symbol?.underlying_symbol.symbol;
            if (underlyingSymbol) {
                if (!optionsByUnderlying[underlyingSymbol]) {
                    optionsByUnderlying[underlyingSymbol] = [];
                }
                optionsByUnderlying[underlyingSymbol].push(option);
            }
        });

        const holdingsToQuantityMap: { [symbol: string]: number } = {};
        stockHoldings.positions?.forEach(holding => {
            if (holding.symbol?.symbol?.symbol && holding.units) {
                holdingsToQuantityMap[holding.symbol?.symbol?.symbol] = holding.units;
            }
        });

        // Helper to generate unique id for a spread
        function generateSpreadId(ticker: string, date: string): string {
            const rand = Math.floor(Math.random() * 1000) + 1;
            return `${ticker}-${date}-${rand}`;
        }

        // Track which options have already been paired in a spread
        const pairedOptionIds = new Set<string>();

        // Analyze each group to determine strategy types
        for (const underlyingSymbol in optionsByUnderlying) {
            const optionsForStock = optionsByUnderlying[underlyingSymbol];

            // Find bull put and bear call credit spreads
            // Only consider options with valid option_symbol
            for (let i = 0; i < optionsForStock.length; i++) {
                const optA = optionsForStock[i];
                const optASymbol = optA.symbol?.option_symbol;
                if (!optASymbol) continue;
                const aId = optA.id || `${optASymbol.option_type}-${optASymbol.strike_price}-${optASymbol.expiration_date}-${optA.units}`;
                if (pairedOptionIds.has(aId)) continue;

                // Only look for matches with opposite sign units
                const aUnits = optA.units || 0;
                if (aUnits === 0) continue;

                // Find all possible candidates for optB
                const candidates = optionsForStock.filter((optB, j) => {
                    if (i === j) return false;
                    const optBSymbol = optB.symbol?.option_symbol;
                    if (!optBSymbol) return false;
                    const bId = optB.id || `${optBSymbol.option_type}-${optBSymbol.strike_price}-${optBSymbol.expiration_date}-${optB.units}`;
                    if (pairedOptionIds.has(bId)) return false;
                    // Only opposite sign units
                    const bUnits = optB.units || 0;
                    if (bUnits === 0 || (aUnits * bUnits > 0)) return false;
                    // Both must be same type (CALL or PUT), same expiration, same underlying, same abs units
                    return (
                        optASymbol.option_type === optBSymbol.option_type &&
                        optASymbol.expiration_date === optBSymbol.expiration_date &&
                        Math.abs(aUnits) === Math.abs(bUnits)
                    );
                });

                if (candidates.length > 0) {
                    // Pick the candidate with the nearest strike price
                    const nearest = candidates.reduce((prev, curr) => {
                        const prevStrike = prev.symbol?.option_symbol?.strike_price ?? 0;
                        const currStrike = curr.symbol?.option_symbol?.strike_price ?? 0;
                        const aStrike = optASymbol.strike_price ?? 0;
                        return Math.abs(currStrike - aStrike) < Math.abs(prevStrike - aStrike) ? curr : prev;
                    });
                    const optB = nearest;
                    const optBSymbol = optB.symbol?.option_symbol!;
                    const bId = optB.id || `${optBSymbol.option_type}-${optBSymbol.strike_price}-${optBSymbol.expiration_date}-${optB.units}`;

                    // For credit spread, the sold (negative units) must have higher purchase price
                    const sold = aUnits < 0 ? optA : optB;
                    const bought = aUnits > 0 ? optA : optB;
                    if (
                        sold.average_purchase_price && bought.average_purchase_price &&
                        sold.average_purchase_price > bought.average_purchase_price
                    ) {
                        let strategyType: SupportedStrategy = 'unknown';
                        if (optASymbol.option_type === 'PUT') {
                            strategyType = 'bull-put-credit-spread';
                        } else if (optASymbol.option_type === 'CALL') {
                            strategyType = 'bear-call-credit-spread';
                        }
                        const spreadId = generateSpreadId(
                            underlyingSymbol,
                            optASymbol.expiration_date
                        );
                        // Add both legs with the same id and strategy
                        categorizedOptions.push({ ...optA, strategyType, id: spreadId });
                        categorizedOptions.push({ ...optB, strategyType, id: spreadId });
                        pairedOptionIds.add(aId);
                        pairedOptionIds.add(bId);
                        // Don't pair these again
                    }
                }
            }

            // Add remaining options (not part of a spread)
            optionsForStock.forEach(option => {
                const optSymbol = option.symbol?.option_symbol;
                const optId = option.id || (optSymbol ? `${optSymbol.option_type}-${optSymbol.strike_price}-${optSymbol.expiration_date}-${option.units}` : undefined);
                if (optId && pairedOptionIds.has(optId)) return;

                let strategyType: SupportedStrategy = 'unknown';
                if (optSymbol) {
                    const optionType = optSymbol.option_type;
                    const absoluteUnits = Math.abs(option.units || 0);
                    const sold = option.units && option.units < 0;
                    if (optionType === 'CALL') {
                        const longPositionQuantity = holdingsToQuantityMap[underlyingSymbol] || 0;
                        if ((longPositionQuantity > (absoluteUnits * 100)) && sold) {
                            strategyType = 'covered-calls';
                        } else if (!sold) {
                            strategyType = 'leap';
                        }
                    } else if (optionType === 'PUT') {
                        const hasSufficientCash = true; // Placeholder for cash check logic
                        if (hasSufficientCash) {
                            strategyType = 'cash-secured-put';
                        }
                    }
                }
                categorizedOptions.push({ ...option, strategyType });
            });
        }

        return categorizedOptions;
    }
}