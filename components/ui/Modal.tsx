import {
  forwardRef,
  HTMLAttributes,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  footer?: ReactNode;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      open,
      onClose,
      title,
      description,
      footer,
      closeOnBackdrop = true,
      closeOnEscape = true,
      children,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(open);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (open) {
        setIsVisible(true);
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }

      return () => {
        document.body.style.overflow = '';
      };
    }, [open]);

    useEffect(() => {
      if (!closeOnEscape) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && open) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [open, onClose, closeOnEscape]);

    // Focus trap
    useEffect(() => {
      if (!open) return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTab);
      firstElement?.focus();

      return () => document.removeEventListener('keydown', handleTab);
    }, [open]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnBackdrop && e.target === e.currentTarget) {
        onClose();
      }
    };

    if (!isVisible && !open) return null;

    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center p-4',
          'bg-black/80 backdrop-blur-sm',
          'transition-opacity duration-200',
          open ? 'opacity-100 animate-fade-in' : 'opacity-0'
        )}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        <div
          ref={modalRef}
          className={cn(
            'relative w-full max-w-lg max-h-[90vh] overflow-y-auto',
            'bg-charcoal border border-border shadow-elevated',
            'transition-all duration-200',
            open ? 'scale-100 animate-scale-in' : 'scale-95',
            className
          )}
          {...props}
        >
          {/* Header */}
          {(title || description) && (
            <div className="px-6 py-4 border-b border-border">
              {title && (
                <h2
                  id="modal-title"
                  className="text-xl font-semibold text-ivory"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="mt-1 text-sm text-muted"
                >
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className={cn(
              'absolute top-4 right-4 p-2',
              'text-muted hover:text-ivory',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2 focus:ring-offset-charcoal'
            )}
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
              strokeLinejoin="miter"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Body */}
          <div className="px-6 py-4 text-ivory">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

export default Modal;
