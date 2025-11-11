import { AlpacaSnapshot } from "@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2";
import { OptionsWithStrategyInformation, SupportedStrategy } from "./option-strategies/option-information-service";

// Format a number with commas (e.g., 200,000)
export const formatNumberWithCommas = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) return "-";
    const numberValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numberValue)) return "-";
    return numberValue % 1 === 0 ? numberValue.toLocaleString() : numberValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
// Utility functions for formatting currency, date, and profit/loss color
export const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
};

export const decodeHtmlEntities = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
};

export const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-US', { timeZone: 'UTC' });
};

export const formatDateWithTimeAndZone = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString('en-US', {
        // timeZone: 'UTC',
        // year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        // timeZoneName: 'short'
    });
}

export const getProfitLossColor = (profitLoss: number | null | undefined) => {
    if (!profitLoss && profitLoss !== 0) return "";
    return profitLoss > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
};

export const extractDateFromContractSymbol = (contract: string) => {
    const dateMatch = contract.match(/\d+/);
    const dateString = dateMatch ? dateMatch[0] : '';
    const date = new Date(
        `20${dateString.substring(0, 2)}-${dateString.substring(2, 4)}-${dateString.substring(4, 6)}T00:00:00-05:00`
    );
    return date;
};

export const getDaysToExpiration = (contract: string) => {
    const expirationDate = extractDateFromContractSymbol(contract);
    const today = new Date();
    const timeDiff = expirationDate.getTime() - today.getTime();
    const daysToExpiration = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysToExpiration;
}

export const extractStrikePriceFromContractSymbol = (contract: string) => {
    const strikeMatch = contract.match(/\d{6}[CP](\d+)/);
    const strikePrice = strikeMatch ? parseFloat(strikeMatch[1]) / 1000 : 0;
    return strikePrice;
};

export const getChangeValueFromAlpacaSnapshot = (snapshot: AlpacaSnapshot | undefined) => {
    const prevClosePrice = snapshot?.PrevDailyBar ? snapshot.PrevDailyBar.ClosePrice : 0;
    const closePrice = snapshot?.DailyBar ? snapshot.DailyBar.ClosePrice : 0;
    return closePrice - prevClosePrice;
};

export const getChangePercentFromAlpacaSnapshot = (snapshot: AlpacaSnapshot | undefined) => {
    if (!snapshot) return 0;
    const prevClosePrice = snapshot.PrevDailyBar ? snapshot.PrevDailyBar.ClosePrice : 0;
    const closePrice = snapshot.DailyBar ? snapshot.DailyBar.ClosePrice : 0;
    if (prevClosePrice === 0) return 0;
    return ((closePrice - prevClosePrice) / prevClosePrice) * 100;
};

export const getProfitLoss = (row: OptionsWithStrategyInformation) => {
    if (!row?.units) return 0;
    const sold = !!row.units && row.units < 0;
    return ((Number(row.price) * 100) - Number(row.average_purchase_price)) * (sold ? -1 : 1);
};

export const strategyTypeToDisplayName: Record<SupportedStrategy, string> = {
    'covered-calls': 'Covered Calls',
    'cash-secured-put': 'Cash Secured Put',
    'leap': 'LEAP',
    'bull-put-credit-spread': 'Bull Put Credit Spread',
    'bear-call-credit-spread': 'Bear Call Credit Spread',
    'unknown': 'Unknown',
};
