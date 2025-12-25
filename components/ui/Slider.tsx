import { forwardRef, InputHTMLAttributes, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helperText?: string;
  showValue?: boolean;
  min?: number;
  max?: number;
  step?: number;
  fullWidth?: boolean;
  onValueChange?: (value: number) => void;
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      label,
      helperText,
      showValue = true,
      min = 0,
      max = 10,
      step = 0.1,
      fullWidth = false,
      id,
      disabled,
      value: controlledValue,
      defaultValue = 0,
      onChange,
      onValueChange,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = useState<number>(
      Number(controlledValue ?? defaultValue)
    );

    useEffect(() => {
      if (controlledValue !== undefined) {
        setValue(Number(controlledValue));
      }
    }, [controlledValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      setValue(newValue);
      onChange?.(e);
      onValueChange?.(newValue);
    };

    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const percentage = ((value - min) / (max - min)) * 100;

    // Determine intensity level for color coding
    const getIntensityColor = () => {
      if (value >= 7) return 'bg-danger';
      if (value >= 4) return 'bg-caution';
      if (value >= 1) return 'bg-warning';
      return 'bg-muted';
    };

    return (
      <div className={cn('flex flex-col gap-2', fullWidth && 'w-full')}>
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && (
              <label
                htmlFor={inputId}
                className={cn(
                  'text-label uppercase text-ivory font-medium',
                  disabled && 'opacity-50'
                )}
              >
                {label}
              </label>
            )}
            {showValue && (
              <span
                className={cn(
                  'text-data font-mono tabular-nums',
                  disabled ? 'text-muted' : 'text-ivory'
                )}
                aria-live="polite"
              >
                {value.toFixed(1)}
              </span>
            )}
          </div>
        )}

        <div className="relative h-touch flex items-center">
          {/* Track background */}
          <div className="absolute inset-y-0 left-0 right-0 flex items-center">
            <div className="w-full h-1 bg-border">
              {/* Active track */}
              <div
                className={cn(
                  'h-full transition-all duration-150',
                  disabled ? 'bg-muted' : getIntensityColor()
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Actual input */}
          <input
            ref={ref}
            type="range"
            id={inputId}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-describedby={helperText ? `${inputId}-helper` : undefined}
            className={cn(
              'relative w-full h-full appearance-none bg-transparent cursor-pointer',
              'disabled:cursor-not-allowed disabled:opacity-50',
              // Thumb styles (browser-specific)
              '[&::-webkit-slider-thumb]:appearance-none',
              '[&::-webkit-slider-thumb]:w-5',
              '[&::-webkit-slider-thumb]:h-5',
              '[&::-webkit-slider-thumb]:border-2',
              '[&::-webkit-slider-thumb]:border-ivory',
              disabled
                ? '[&::-webkit-slider-thumb]:bg-muted'
                : '[&::-webkit-slider-thumb]:bg-orange',
              '[&::-webkit-slider-thumb]:transition-all',
              '[&::-webkit-slider-thumb]:duration-150',
              '[&::-webkit-slider-thumb:hover]:scale-110',
              '[&::-webkit-slider-thumb:active]:scale-95',
              '[&::-moz-range-thumb]:appearance-none',
              '[&::-moz-range-thumb]:w-5',
              '[&::-moz-range-thumb]:h-5',
              '[&::-moz-range-thumb]:border-2',
              '[&::-moz-range-thumb]:border-ivory',
              '[&::-moz-range-thumb]:border-none',
              disabled
                ? '[&::-moz-range-thumb]:bg-muted'
                : '[&::-moz-range-thumb]:bg-orange',
              '[&::-moz-range-thumb]:transition-all',
              '[&::-moz-range-thumb]:duration-150',
              '[&::-moz-range-thumb:hover]:scale-110',
              '[&::-moz-range-thumb:active]:scale-95',
              'focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2 focus:ring-offset-black',
              className
            )}
            {...props}
          />
        </div>

        {helperText && (
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

Slider.displayName = 'Slider';

export default Slider;
