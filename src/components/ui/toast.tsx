import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const toastVariants = cva(
  'relative flex w-full items-center justify-between gap-3 px-4 py-3 rounded-lg shadow-lg border',
  {
    variants: {
      variant: {
        default: 'bg-background border-border',
        destructive: 'bg-destructive text-destructive-foreground border-destructive',
        success: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400',
        warning: 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400',
        info: 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
  id: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(toastVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Toast.displayName = 'Toast';

const ToastViewport = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'fixed top-0 right-0 z-[100] flex flex-col gap-2 p-4 w-full max-w-[400px]',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = 'ToastViewport';

const ToastTitle = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn('text-sm font-semibold leading-none', className)}
    {...props}
  />
));
ToastTitle.displayName = 'ToastTitle';

const ToastDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm opacity-90 leading-relaxed', className)}
    {...props}
  />
));
ToastDescription.displayName = 'ToastDescription';

const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      'absolute top-2 right-2 p-1 rounded-full hover:bg-muted/80 transition-colors',
      className
    )}
    {...props}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  </button>
));
ToastClose.displayName = 'ToastClose';

export {
  Toast,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
  toastVariants,
  type ToastProps,
};
