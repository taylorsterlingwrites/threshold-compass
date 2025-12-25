import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      fullWidth = false,
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const hasError = !!error;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-label uppercase text-ivory font-medium',
              disabled && 'opacity-50'
            )}
          >
            {label}
            {required && <span className="text-danger ml-1" aria-label="required">*</span>}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          className={cn(
            'h-touch px-4 bg-black border text-ivory font-sans',
            'transition-all duration-150',
            'placeholder:text-muted',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            hasError
              ? 'border-danger focus:ring-danger'
              : 'border-border focus:ring-orange',
            fullWidth && 'w-full',
            className
          )}
          {...props}
        />

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-danger"
            role="alert"
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="text-sm text-subtle"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
