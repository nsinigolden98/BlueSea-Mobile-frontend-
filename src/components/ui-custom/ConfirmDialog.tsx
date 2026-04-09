import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'danger';
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
}: ConfirmDialogProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-4 mb-4">
          {variant === 'danger' && (
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              {title}
            </h3>
          </div>
        </div>
        
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {message}
        </p>
        
        <div className="flex gap-3">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={`flex-1 ${
              variant === 'danger' 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-sky-500 hover:bg-sky-600'
            }`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

export function useConfirm() {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: 'Confirm',
    message: 'Are you sure?',
  });
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(options);
      setResolveRef(() => resolve);
      setVisible(true);
    });
  }, []);

  const handleConfirm = () => {
    setVisible(false);
    if (resolveRef) {
      resolveRef(true);
      setResolveRef(null);
    }
  };

  const handleCancel = () => {
    setVisible(false);
    if (resolveRef) {
      resolveRef(false);
      setResolveRef(null);
    }
  };

  const ConfirmComponent = () => (
    <ConfirmDialog
      visible={visible}
      title={options.title}
      message={options.message}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      variant={options.variant}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, ConfirmComponent };
}