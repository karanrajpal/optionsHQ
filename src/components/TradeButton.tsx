import Link from 'next/link';
import { Button } from './ui/button';
import { SiChase, SiRobinhood } from 'react-icons/si';

type TradeButtonProps = {
  link: string;
  institutionName: string;
};
export const TradeButton = ({ link, institutionName }: TradeButtonProps) => {
  let icon = null;
  if (institutionName === 'Fidelity') {
    icon = <img width={16} height={16} src="/fidelity.png" alt="Trade Icon" className="mr-2" />;
  } else if (institutionName === 'Chase') {
    icon = <SiChase className="w-4 h-4 mr-2" />;
  } else if (institutionName === 'Robinhood') {
    icon = <SiRobinhood className="w-4 h-4 mr-2" />;
  }

  return (
    <Link className="m-0" href={link} target="_blank" rel="noopener noreferrer">
      <Button variant="outline" className="flex items-center px-3 py-1 text-xs font-medium">
        {icon}
        Trade
      </Button>
    </Link>
  );
};