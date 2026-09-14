'use client';

import { useState } from 'react';
import { ChevronUp, Wrench } from 'lucide-react';

const tracker = [
  ['Auth & Routing', 'Completed'],
  ['Shared Layout', 'Completed'],
  ['Super Dashboard', 'Completed'],
  ['School Dashboard', 'Completed'],
  ['Lecturer Dashboard', 'Completed'],
];

export function DevPanel() {
  const [open, setOpen] = useState(false);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[80]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full bg-brand-navy px-4 py-3 text-sm font-semibold text-white shadow-card"
      >
        <Wrench className="h-4 w-4" />
        Dev Panel
        <ChevronUp className={`h-4 w-4 transition-all duration-200 ease-in-out ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div className="mt-3 w-80 rounded-xl bg-white p-4 shadow-card">
          <p className="mb-3 text-sm font-bold text-text-primary">MVP Tracker</p>
          <div className="space-y-2">
            {tracker.map(([task, status]) => (
              <div key={task} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm">
                <span className="text-text-primary">{task}</span>
                <span className="font-medium text-status-optimal">{status}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
