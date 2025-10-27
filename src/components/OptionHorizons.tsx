'use client';

import { Button } from '@/components/ui/button';

export type OptionHorizonType = 'make-premiums' | 'leaps';

interface OptionHorizonsProps {
  selected: OptionHorizonType;
  onSelect: (horizon: OptionHorizonType) => void;
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
