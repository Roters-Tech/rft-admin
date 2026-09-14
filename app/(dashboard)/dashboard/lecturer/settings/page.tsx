import { Bell, Lock, Palette } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';

const settings = [
  { icon: Bell, title: 'Notifications', note: 'Delivery alerts, reminder cadence, and reviewer updates.' },
  { icon: Lock, title: 'Security', note: 'Session security, trusted devices, and access recovery states.' },
  { icon: Palette, title: 'Workspace Preferences', note: 'Default course view, grading density, and layout behavior.' },
];

export default function LecturerSettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        subtitle="A clean preferences surface ready for backend-backed user settings later."
      />
      <div className="grid gap-5 xl:grid-cols-3">
        {settings.map((item) => {
          const Icon = item.icon;
          return (
            <Panel key={item.title}>
              <Icon className="h-5 w-5 text-brand-navy" />
              <p className="mt-4 text-base font-bold text-text-primary">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{item.note}</p>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
