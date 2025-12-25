import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type BadgeStatus = 'clear' | 'mild' | 'moderate' | 'high';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status?: BadgeStatus;
  variant?: 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      status = 'clear',
      variant = 'solid',
      size = 'md',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-sans font-medium uppercase tracking-wide';

    const statusStyles = {
      solid: {
        clear: 'bg-success/20 text-success border border-success/40',
        mild: 'bg-warning/20 text-warning border border-warning/40',
        moderate: 'bg-caution/20 text-caution border border-caution/40',
        high: 'bg-danger/20 text-danger border border-danger/40',
      },
      outline: {
        clear: 'bg-transparent text-success border border-success',
        mild: 'bg-transparent text-warning border border-warning',
        moderate: 'bg-transparent text-caution border border-caution',
        high: 'bg-transparent text-danger border border-danger',
      },
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-label',
      lg: 'px-4 py-1.5 text-sm',
    };

    const statusText = {
      clear: children || 'Clear',
      mild: children || 'Mild',
      moderate: children || 'Moderate',
      high: children || 'High',
    };

    return (
      <span
        ref={ref}
        className={cn(
          baseStyles,
          statusStyles[variant][status],
          sizes[size],
          className
        )}
        role="status"
        aria-label={`Status: ${status}`}
        {...props}
      >
        {statusText[status]}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
