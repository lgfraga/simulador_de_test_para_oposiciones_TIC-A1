import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastViewport,
  ToastTitle,
} from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <>
      {toasts.map(({ id, title, description, open, onOpenChange }) => (
        <Toast key={id} id={id} open={open} onOpenChange={onOpenChange}>
          <div className="flex-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </>
  );
}
