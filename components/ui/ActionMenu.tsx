'use client';

import { useEffect, useRef, useState } from 'react';
import { EllipsisVertical } from 'lucide-react';

interface ActionMenuProps {
  align?: 'left' | 'right';
}

export function ActionMenu({ align = 'right' }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-lg p-2 text-text-secondary transition-all duration-200 ease-in-out hover:bg-brand-navy-light hover:text-brand-navy"
      >
        <EllipsisVertical className="h-4 w-4" />
      </button>
      {open ? (
        <div
          className={`absolute top-10 z-20 w-40 rounded-xl border border-gray-100 bg-white p-2 shadow-card ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {['Edit', 'Deactivate', 'View Profile'].map((item) => (
            <button
              key={item}
              type="button"
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-text-secondary transition-all duration-200 ease-in-out hover:bg-brand-navy-light hover:text-brand-navy"
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
