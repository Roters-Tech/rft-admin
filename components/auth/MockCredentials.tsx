import { User } from '@/types';

interface MockCredentialsProps {
  users: User[];
  onSelect: (user: User) => void;
}

export function MockCredentials({ users, onSelect }: MockCredentialsProps) {
  return (
    <div className="rounded-lg bg-brand-navy-light p-4">
      <p className="mb-3 text-sm font-bold text-text-primary">🔑 Demo Credentials</p>
      <div className="space-y-2">
        {users.map((user) => (
          <button
            key={user.id}
            type="button"
            onClick={() => onSelect(user)}
            className="flex w-full flex-col rounded-lg px-3 py-2 text-left transition-all duration-200 ease-in-out hover:bg-white"
          >
            <span className="text-xs font-bold text-brand-navy">{user.title}</span>
            <span className="font-mono text-xs text-text-secondary">{user.email}</span>
            <span className="font-mono text-xs text-text-secondary">{user.password}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
