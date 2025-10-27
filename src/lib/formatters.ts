// Utility functions for formatting currency, date, and profit/loss color
export const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
};

export const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
};

export const getProfitLossColor = (profitLoss: number | null | undefined) => {
    if (!profitLoss && profitLoss !== 0) return "";
    return profitLoss > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
};