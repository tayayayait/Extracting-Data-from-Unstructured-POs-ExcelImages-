import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        {/* Set duration based on variant / spec:
            info/success = 4000ms, warning = 6000ms, error (destructive) = Infinity (수동 닫힘) */}
        let duration = 4000;
        if ((variant as string) === "warning") duration = 6000;
        else if (variant === "destructive") duration = 10000000; // Almost infinite

        return (
          <Toast key={id} variant={variant} duration={duration} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
