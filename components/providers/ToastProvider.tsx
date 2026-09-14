'use client';

import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { ToastItem } from '@/types';

interface ToastContextValue {
  showToast: (title: string, type: ToastItem['type']) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (title: string, type: ToastItem['type']) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, title, type }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const value = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex min-w-[280px] items-center gap-3 rounded-xl border px-4 py-3 shadow-card transition-all duration-200 ease-in-out ${
              toast.type === 'success'
                ? 'border-status-optimal/20 bg-status-optimal text-white'
                : 'border-status-critical/20 bg-status-critical text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            <span className="text-sm font-medium">{toast.title}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}
