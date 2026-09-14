import { UploadCloud } from 'lucide-react';

import { AppButton } from '@/components/ui/AppButton';

interface ContentUploadPanelProps {
  title: string;
  subtitle: string;
  href?: string;
}

export function ContentUploadPanel({ title, subtitle, href }: ContentUploadPanelProps) {
  return (
    <div className="rounded-xl bg-brand-navy p-5 text-white">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-1 text-sm text-white/70">{subtitle}</p>
      <div className="mt-5 rounded-lg border border-dashed border-white/30 p-4 text-center">
        <UploadCloud className="mx-auto h-8 w-8 text-brand-gold" />
        <p className="mt-3 text-sm text-white/70">Drag files here to upload</p>
      </div>
      <AppButton
        href={href}
        variant="ghost"
        className="mt-4 w-full bg-brand-gold py-3 font-bold text-brand-navy hover:brightness-95"
        toastMessage={href ? undefined : 'File selector opened for upload.'}
      >
        SELECT FILES / GOTO CONTENT
      </AppButton>
    </div>
  );
}
