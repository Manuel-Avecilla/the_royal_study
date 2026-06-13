import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'ghost' | 'outline' | 'danger' | 'none';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'none';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-sans font-semibold transition-all duration-200 select-none active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal/50 focus-visible:ring-offset-1 disabled:opacity-30 disabled:pointer-events-none';

    const variants = {
      primary: 'bg-royal text-white hover:bg-royal-dark shadow-sm',
      secondary: 'border border-parchment-dark text-royal bg-white hover:bg-parchment-light shadow-sm',
      gold: 'bg-gold text-white hover:bg-gold-dark shadow-sm',
      outline: 'border border-current bg-transparent',
      ghost: 'text-royal hover:bg-parchment-light',
      danger: 'bg-accent-rose text-white hover:bg-accent-rose/90 shadow-sm',
      none: '',
    };


    const sizes = {
      sm: 'py-1.5 px-4 text-[10px] md:text-xs rounded-full',
      md: 'py-2 px-5 text-xs md:text-sm rounded-full',
      lg: 'py-3.5 px-6 md:py-4 md:px-8 text-sm md:text-base lg:text-lg rounded-full',
      icon: 'p-1.5 md:p-2.5 rounded-lg transition-all',
      none: '',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
export default Button;
