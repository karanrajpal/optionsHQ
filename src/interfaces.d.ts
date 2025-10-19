
export interface OptionTransaction {
  id: number;
  symbol: string;
  type: 'call' | 'put';
  strike_price: number;
  expiry_date: string; 
  transaction_type: 'buy' | 'sell';
  quantity: number;
  price: number;
  transaction_date: string; 
  brokerage: string;
}
