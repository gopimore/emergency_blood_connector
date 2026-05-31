import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { cn } from '../lib/cn';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(({ title, description, variant = 'success', duration = 4000 }) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { id, title, description, variant }]);
    window.setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  const value = useMemo(() => ({
    success: (title, description) => pushToast({ title, description, variant: 'success' }),
    error: (title, description) => pushToast({ title, description, variant: 'error' }),
  }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3 p-2 sm:right-6 sm:top-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto overflow-hidden rounded-2xl border p-4 shadow-xl backdrop-blur transition-transform duration-200',
              toast.variant === 'success'
                ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
                : 'border-red-400/30 bg-red-500/10 text-red-100'
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{toast.title}</p>
                {toast.description && <p className="mt-1 text-sm text-slate-300">{toast.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1 text-xs text-slate-300 transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
