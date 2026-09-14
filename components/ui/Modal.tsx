'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-brand-navy/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-[0_30px_80px_rgba(15,30,90,0.28)]">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-2xl font-bold text-text-primary">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-text-secondary transition-all duration-200 ease-in-out hover:bg-brand-navy-light hover:text-brand-navy"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
