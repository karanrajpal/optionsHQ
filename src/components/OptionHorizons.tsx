'use client';

import { StrategyType } from '@/app/discover/page';
import { Button } from '@/components/ui/button';

interface OptionHorizonsProps {
  selected: StrategyType;
  onSelect: (horizon: StrategyType) => void;
}

export function OptionHorizons({ selected, onSelect }: OptionHorizonsProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant={selected === 'make-premiums' ? 'default' : 'outline'}
        onClick={() => onSelect('make-premiums')}
        className="rounded-full"
      >
        Make Premiums
      </Button>
      <Button
        variant={selected === 'leaps' ? 'default' : 'outline'}
        onClick={() => onSelect('leaps')}
        className="rounded-full"
      >
        LEAPS
      </Button>
    </div>
  );
}
