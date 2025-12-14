import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: () => void }> = ({ toast, onRemove }) => {
  // Auto dismiss
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const icons = {
    success: <CheckCircle size={20} className="text-green-500" />,
    error: <XCircle size={20} className="text-red-500" />,
    warning: <AlertCircle size={20} className="text-yellow-500" />,
    info: <Info size={20} className="text-blue-500" />
  };

  const borders = {
    success: 'border-l-4 border-l-green-500',
    error: 'border-l-4 border-l-red-500',
    warning: 'border-l-4 border-l-yellow-500',
    info: 'border-l-4 border-l-blue-500',
  };

  return (
    <div className={`
      pointer-events-auto bg-white rounded-lg shadow-xl border border-gray-100 p-4 flex items-start gap-3 
      transform transition-all duration-300 animate-slide-in-right ${borders[toast.type]}
    `}>
      <div className="mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-gray-800">{toast.title}</h4>
        {toast.message && <p className="text-xs text-gray-500 mt-1">{toast.message}</p>}
      </div>
      <button onClick={onRemove} className="text-gray-400 hover:text-gray-600">
        <X size={16} />
      </button>
    </div>
  );
};

export default ToastContainer;