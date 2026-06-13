import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'gold' | 'outline';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const variants = {
      primary: 'bg-royal text-white',
      gold: 'bg-gold text-white',
      outline: 'border border-parchment-dark text-royal bg-white',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'text-[9px] md:text-[11px] lg:text-xs px-1.5 py-0.5 md:px-2.5 md:py-1 rounded font-sans font-semibold inline-flex items-center justify-center',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export default Badge;
