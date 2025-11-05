import { Item, ItemTitle } from '@/components/ui/item';
import { Ticker, TickerPrice, TickerPriceChange, TickerSymbol } from '@/components/ui/shadcn-io/ticker';

interface TickerPriceItemProps {
    ticker: string;
    latestPrice: number;
    changePercent: number;
};

export const TickerPriceItem = ({ ticker, latestPrice, changePercent }: TickerPriceItemProps) => {
    return (
        <Item variant="default" className="w-fit">
            <ItemTitle>
                <Ticker>
                    <TickerSymbol className='text-2xl' symbol={ticker.toUpperCase()} />
                    <TickerPrice price={latestPrice} />
                    <TickerPriceChange change={changePercent} />
                </Ticker>
            </ItemTitle>
        </Item>
    );
}

type StockCardProps = {
    ticker: string;
    latestPrice: number;
    changePercent: number;
    quantity?: number;
};

export const StockCard = ({ ticker, latestPrice, changePercent, quantity }: StockCardProps) => {
    return (
        <div className="border rounded-lg shadow-sm bg-slate-100 dark:bg-gray-900">
            <TickerPriceItem
                ticker={ticker}
                latestPrice={latestPrice}
                changePercent={changePercent}
            />
            {quantity !== undefined && (
                <div className="ml-5 mb-2 text-sm text-gray-400">
                    {quantity.toFixed(2)} shares
                </div>
            )}
        </div>
    );
};
