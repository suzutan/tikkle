import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, indicatorClassName, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative h-3 w-full overflow-hidden rounded-full bg-gray-200', className)}
      {...props}
    >
      <div
        className={cn('h-full rounded-full transition-all', indicatorClassName ?? 'bg-blue-600')}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  ),
);
Progress.displayName = 'Progress';

export { Progress };
