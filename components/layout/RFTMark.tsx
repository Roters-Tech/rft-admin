import { GraduationCap } from 'lucide-react';

interface RFTMarkProps {
  compact?: boolean;
  dark?: boolean;
}

export function RFTMark({ compact = false, dark = false }: RFTMarkProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center justify-center rounded-xl ${dark ? 'bg-brand-navy text-white' : 'bg-white text-brand-navy'} ${compact ? 'h-8 w-8' : 'h-10 w-10'}`}>
        <GraduationCap className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
      </div>
      <div>
        <p className={`font-display font-bold ${dark ? 'text-text-primary' : 'text-white'}`}>RFT</p>
        <p className={`text-[9px] font-semibold uppercase tracking-[0.32em] ${dark ? 'text-text-secondary' : 'text-white/70'}`}>
          Learn. Grow. Succeed.
        </p>
      </div>
    </div>
  );
}
