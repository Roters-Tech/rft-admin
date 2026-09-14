import { UserPlus } from 'lucide-react';
import { Lecturer } from '@/types';
import { LecturerList } from '@/components/dashboard/LecturerList';
import { AppButton } from '@/components/ui/AppButton';

interface ManagePanelProps {
  title: string;
  items: Lecturer[];
  cta: string;
  iconOnly?: boolean;
  href?: string;
}

export function ManagePanel({ title, items, cta, iconOnly = false, href }: ManagePanelProps) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-card">
      <h3 className="text-lg font-bold text-text-primary">{title}</h3>
      <div className="mt-4">
        <LecturerList items={items} />
      </div>
      <AppButton
        href={href}
        variant="secondary"
        className={`mt-4 flex w-full border-2 border-dashed py-4 text-text-secondary ${
          iconOnly ? 'border-gray-200' : 'border-gray-200'
        }`}
        toastMessage={href ? undefined : `${cta.replace('+ ', '')} workflow opened.`}
      >
        {iconOnly ? <UserPlus className="h-4 w-4" /> : null}
        {cta}
      </AppButton>
    </div>
  );
}
