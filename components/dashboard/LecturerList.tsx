import { ChevronRight } from 'lucide-react';
import { Lecturer } from '@/types';
import { Avatar } from '@/components/ui/Avatar';

interface LecturerListProps {
  items: Lecturer[];
}

export function LecturerList({ items }: LecturerListProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="flex w-full items-center justify-between rounded-xl px-3 py-3 transition-all duration-200 ease-in-out hover:bg-brand-navy-light"
        >
          <div className="flex items-center gap-3">
            <Avatar name={item.name} className="h-10 w-10 text-xs" />
            <div className="text-left">
              <p className="text-sm font-semibold text-text-primary">{item.name}</p>
              <p className="text-xs text-text-secondary">{item.department}</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-text-muted" />
        </button>
      ))}
    </div>
  );
}
