import { Item, ItemTitle } from '@/components/ui/item';
import { Ticker, TickerPrice, TickerPriceChange, TickerSymbol } from '@/components/ui/shadcn-io/ticker';
import { formatCurrency, formatNumberWithCommas } from '@/lib/formatters';
import Link from 'next/link';
import { Button } from './ui/button';
import { useUserDataAccounts } from '@/context/UserDataAccountsProvider';
import { useSnaptradeAccount } from '@/context/SnaptradeAccountsProvider';
import { SiChase, SiRobinhood } from 'react-icons/si';
import { TradeButton } from './TradeButton';

interface TickerPriceItemProps {
    ticker?: string;
    latestPrice: number;
    changePrice?: number;
    changePercent?: number;
};

export const TickerPriceItem = ({ ticker, latestPrice, changePrice, changePercent }: TickerPriceItemProps) => {
    return (
        <Item variant="default" className="w-fit p-2 ml-2">
            <ItemTitle>
                <Ticker>
                    {ticker ? <TickerSymbol className='text-lg' symbol={ticker.toUpperCase()} /> : null}
                    <TickerPrice className='text-2xl text-accent-foreground' price={latestPrice} />
                    {changePrice !== undefined && (
                        <TickerPriceChange isPercent={false} change={changePrice} />
                    )}
                    {changePercent !== undefined && (
                        <TickerPriceChange isPercent={true} change={changePercent} />
                    )}
                </Ticker>
            </ItemTitle>
        </Item>
    );
}

type StockCardProps = {
    ticker: string;
    latestPrice: number;
    changePercent: number;
    changePrice?: number;
    quantity?: number;
    averagePurchasePrice?: number;
};

export const StockCard = ({ ticker, latestPrice, changePercent, changePrice, quantity, averagePurchasePrice }: StockCardProps) => {
    const { selectedAccount } = useSnaptradeAccount();
    return (
        <div className="border rounded-t-lg shadow-sm bg-slate-100 dark:bg-gray-900 flex flex-wrap items-center justify-between">
            <div className='flex flex-col'>
                <Link href={`/stock/${ticker}`} className="block w-fit">
                    <TickerPriceItem
                        ticker={ticker}
                        latestPrice={latestPrice}
                        changePrice={changePrice}
                        changePercent={changePercent}
                    />
                </Link>
                <div className="flex flex-wrap ml-4 mb-3">
                    {quantity !== undefined && (
                        <div className="text-sm text-muted-foreground">
                            {formatNumberWithCommas(quantity)} shares
                        </div>
                    )}
                    {averagePurchasePrice !== undefined && (
                        <div className="ml-5 text-sm text-muted-foreground">
                            Avg Cost: {formatCurrency(averagePurchasePrice)}
                        </div>
                    )}
                </div>
            </div>
            {selectedAccount && (
                <TradeButton
                    link={`https://digital.fidelity.com/ftgw/digital/trade-options?ORDER_TYPE=O&SYMBOL=${ticker}`}
                    institutionName={selectedAccount.institution_name || ''}
                />
            )}
        </div>
    );
};
