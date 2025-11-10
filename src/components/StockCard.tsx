import { Item, ItemTitle } from '@/components/ui/item';
import { Ticker, TickerPrice, TickerPriceChange, TickerSymbol } from '@/components/ui/shadcn-io/ticker';
import { formatNumberWithCommas } from '@/lib/formatters';
import Link from 'next/link';
import { Button } from './ui/button';

interface TickerPriceItemProps {
    ticker?: string;
    latestPrice: number;
    changePrice?: number;
    changePercent?: number;
};

export const TickerPriceItem = ({ ticker, latestPrice, changePrice, changePercent }: TickerPriceItemProps) => {
    return (
        <Item variant="default" className="w-fit">
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
};

export const StockCard = ({ ticker, latestPrice, changePercent, changePrice, quantity }: StockCardProps) => {
    return (
        <div className="border rounded-lg shadow-sm bg-slate-100 dark:bg-gray-900">
            <div className="flex justify-between items-center mr-2">
                <Link href={`/stock/${ticker}`} className="block w-fit">
                    <TickerPriceItem
                        ticker={ticker}
                        latestPrice={latestPrice}
                        changePrice={changePrice}
                        changePercent={changePercent}
                    />
                </Link>
                <div className="flex p-1">
                    <Link href={`https://digital.fidelity.com/ftgw/digital/trade-options?ORDER_TYPE=O&SYMBOL=${ticker}`} target="_blank" rel="noopener noreferrer">
                        <Button variant='outline' className="flex items-center px-4 py-2 text-sm font-medium">
                            <img width={16} height={16} src="/fidelity.png" alt="Trade Icon" className="mr-2" />
                            Trade
                        </Button>
                    </Link>
                </div>
            </div>
            {quantity !== undefined && (
                <div className="ml-5 mb-2 text-sm text-gray-400">
                    {formatNumberWithCommas(quantity)} shares
                </div>
            )}
        </div>
    );
};
