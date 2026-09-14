'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { useToast } from '@/components/providers/ToastProvider';

interface AppButtonProps {
  children: ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  toastMessage?: string;
  onClick?: () => void;
}

const styles = {
  primary:
    'bg-brand-navy text-white hover:bg-brand-navy-deep',
  secondary:
    'border border-gray-200 bg-white text-text-primary hover:border-brand-navy hover:text-brand-navy',
  ghost:
    'bg-brand-navy-light text-brand-navy hover:bg-brand-navy hover:text-white',
};

export function AppButton({
  children,
  href,
  variant = 'primary',
  className = '',
  toastMessage,
  onClick,
}: AppButtonProps) {
  const { showToast } = useToast();
  const sharedClassName = `inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-navy ${styles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={sharedClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={sharedClassName}
      onClick={(e) => {
        if (onClick) onClick();
        if (toastMessage) {
          showToast(toastMessage, 'success');
        }
      }}
    >
      {children}
    </button>
  );
}

