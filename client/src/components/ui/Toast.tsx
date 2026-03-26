import React from 'react';
import { useToast } from '../../contexts/ToastContext';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle size={20} className="text-success" />,
  error: <XCircle size={20} className="text-error" />,
  warning: <AlertCircle size={20} className="text-warning" />,
  info: <Info size={20} className="text-info" />,
};

const colors = {
  success: 'border-l-success bg-green-50',
  error: 'border-l-error bg-red-50',
  warning: 'border-l-warning bg-amber-50',
  info: 'border-l-info bg-blue-50',
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`card border-l-4 px-4 py-3 flex items-start gap-3 animate-slide-up ${colors[toast.type]}`}
          role="alert"
        >
          <div className="mt-0.5 flex-shrink-0">{icons[toast.type]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
            {toast.message && <p className="text-xs text-gray-600 mt-0.5">{toast.message}</p>}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 p-0.5 hover:bg-white/80 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X size={14} className="text-gray-500" />
          </button>
        </div>
      ))}
    </div>
  );
};
