import { User } from '@/types';

interface AvatarProps {
  name: string;
  className?: string;
  square?: boolean;
}

export function Avatar({ name, className = '', square = false }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`flex items-center justify-center bg-brand-navy font-display font-bold text-white ${square ? 'rounded-xl' : 'rounded-full'} ${className}`}
    >
      {initials}
    </div>
  );
}
