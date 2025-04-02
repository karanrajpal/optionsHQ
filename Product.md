# Options Dashboard
## Tasks
Translate Fidelity CSV to our own data format  
Database to store stuff  
Deploy to Netlify  
Netlify status badge on git  
Pre-process spread options and insert only 1 row in the DB
Get stock price of related tickers for past 2 years stored for daily frequency from [polygon](https://polygon.io/pricing)
Later backfill stock prices if needed from a different API

## Dashboard features
- Options Performance - Table of options (ticker, expiry date, type of option, premiums earned, current price (from Fidelity CSV), % of money made, APR) with filter for current
- Watchlist - Add/Remove list of tickers
- Options Finder - Given a list of tickers (like AMZN, AAPL) use Polygon API to find a good option to trade (Also show next earnings date + highlight if recommendation includes the earnings date)
    - Next Earnings OR earnings calendar(low priority) for list of stocks
    - Requirements for a good option are -> 6 weeks out from today + expected rate of interest = 1.5%
- (Low Priority) Stocks Finder - Given a list of tickers, organize by the biggest dips over different period of times

## Example worksheet
200$ * 100 = 0.15* $20000 = 300$
Find me an AMZN Option for May 14th whose premium = 300$
If Answer = 210$ -> It means that the market is not expecting a move too much (less volatile)
If Answer = 230$ -> It means that the market is expecting a big move (more volatile)

Goal -> Minimal failed guesses for maximum reward

Successfuly expired options | Need-to-be-rolled-options
Income target 0.5% -> 98 | 2
Income target 1% -> 96 | 4
Income target 1.5% -> 90 | 10
Income target 2% -> 80 | 20


170..............180...................190......................200

Roll = Pay 2000, Earn 3000
Roll Closer to Target (185) = Pay 2000, Earn 3000

URNM price = 45$.
Total Premiums earned = 75$
Total Locked up amt = 45 * 100$ = 4500
Percentage earned for the option trade = 75/4500


## Terms
% of money made -> Based on how much money is locked up (either in stocks or cash)
type of option -> SELL CALL, SELL PUT, SPREAD, BUY CALL (LEAPS)
Roll -> (BUY CALL, SELL CALL) OR (BUY PUT, SELL PUT) at the exact same time. Same ticker, same quantity. Price and expiry date probably will vary.
Spread -> (BUY CALL, SELL CALL) OR (BUY PUT, SELL PUT) at the exact same time. Same ticker, same quantity. Price and expiry date probably will vary.

## Open Questions
1. Can we get historical transactions from Fidelity?
