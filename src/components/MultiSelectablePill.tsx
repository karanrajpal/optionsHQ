import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface MultiSelectablePillProps {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export function MultiSelectablePill({ options, selected, onChange, className }: MultiSelectablePillProps) {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter(v => v !== value));
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map(opt => {
        const isActive = selected.includes(opt.value);
        return (
          <Button
            key={opt.value}
            type="button"
            variant={isActive ? 'default' : 'outline'}
            className={cn('rounded-full px-4 py-1 flex items-center gap-1', isActive && 'bg-primary text-primary-foreground')}
            onClick={() => handleToggle(opt.value)}
          >
            <span>{opt.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
