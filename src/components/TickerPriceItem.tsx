import { Item, ItemTitle } from '@/components/ui/item';
import { Ticker, TickerPrice, TickerPriceChange, TickerSymbol } from '@/components/ui/shadcn-io/ticker';

// TickerPriceItem component
interface TickerPriceItemProps {
    ticker: string;
    latestPrice: number;
    changePercent: number;
};

export const TickerPriceItem = ({ ticker, latestPrice, changePercent }: TickerPriceItemProps) => {
    return (
        <Item variant="outline" className="w-fit">
            <ItemTitle>
                <Ticker>
                    <TickerSymbol symbol={ticker.toUpperCase()} />
                    <TickerPrice price={latestPrice} />
                    <TickerPriceChange change={changePercent} />
                </Ticker>
            </ItemTitle>
        </Item>
    );
}