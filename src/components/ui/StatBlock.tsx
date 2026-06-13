import React from 'react';
import { cn } from '../../lib/utils';

export interface StatBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'danger' | 'info' | 'warning';
  icon: React.ReactNode;
  label: React.ReactNode;
  value?: React.ReactNode;
  layout?: 'auto' | 'vertical' | 'horizontal';
}

export const StatBlock = React.forwardRef<HTMLDivElement, StatBlockProps>(
  ({ className, variant = 'info', icon, label, value, layout = 'auto', children, ...props }, ref) => {
    const containerVariants = {
      danger: 'bg-red-50/50 border-red-100 text-red-700',
      info: 'bg-blue-50/50 border-blue-100 text-blue-700',
      warning: 'bg-amber-50/70 border-amber-100 text-amber-800',
    };

    const iconVariants = {
      danger: 'bg-red-100/50 text-red-600',
      info: 'bg-blue-100/50 text-blue-600',
      warning: 'bg-amber-100/60 text-amber-600',
    };

    const textVariants = {
      danger: 'text-red-955',
      info: 'text-blue-955',
      warning: 'text-amber-955',
    };

    const isVertical = layout === 'vertical' || (layout === 'auto' && !!children);
    
    const flexClasses = isVertical 
      ? 'flex flex-col items-center justify-between p-1.5 md:p-5' 
      : 'flex flex-col items-center justify-center p-1.5 md:p-5 md:flex-row md:justify-between';

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl md:rounded-2xl border w-full transition-all',
          flexClasses,
          containerVariants[variant],
          className
        )}
        {...props}
      >
        <div className={cn(
          'flex flex-col md:flex-row items-center gap-0.5 md:gap-2.5',
          isVertical ? 'w-full text-center md:text-left' : ''
        )}>
          <div className={cn('p-0.5 md:p-1.5 rounded-md md:rounded-lg', iconVariants[variant])}>
            {icon}
          </div>
          <span className={cn('font-sans text-[7px] md:text-xs font-bold tracking-tight leading-none md:leading-tight', textVariants[variant])}>
            {label}
          </span>
        </div>

        {children ? (
          <div className="w-full">
            {children}
          </div>
        ) : (
          value !== undefined && (
            <span className={cn(
              'font-sans text-xs md:text-xl font-bold mt-0.5 md:mt-0 leading-none',
              variant === 'warning' ? 'font-extrabold' : '',
              textVariants[variant]
            )}>
              {value}
            </span>
          )
        )}
      </div>
    );
  }
);
StatBlock.displayName = 'StatBlock';

export default StatBlock;
