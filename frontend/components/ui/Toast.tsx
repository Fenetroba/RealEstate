'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeToast } from '@/store/slices/uiSlice';
import { cn } from '@/lib/utils';

const icons = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
};

const styles = {
  success: 'border-l-4 border-green-500',
  error: 'border-l-4 border-red-500',
  warning: 'border-l-4 border-amber-500',
  info: 'border-l-4 border-blue-500',
};

function ToastItem({ id, type, title, message, duration = 4000 }: {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(id)), duration);
    return () => clearTimeout(timer);
  }, [id, duration, dispatch]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className={cn(
        'flex items-start gap-3 bg-card text-card-foreground rounded-xl p-4 shadow-xl min-w-[320px] max-w-sm',
        styles[type]
      )}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm">{title}</p>
        {message && <p className="text-xs text-muted mt-0.5">{message}</p>}
      </div>
      <button
        onClick={() => dispatch(removeToast(id))}
        className="flex-shrink-0 p-1 rounded hover:bg-surface transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4 text-gray-400" />
      </button>
    </motion.div>
  );
}

function ToastContainer() {
  const toasts = useAppSelector((state) => state.ui.toasts);

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

export { ToastContainer };
