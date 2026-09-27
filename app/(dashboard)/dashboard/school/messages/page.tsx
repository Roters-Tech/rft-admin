// import { AnonymousMessagesView } from '@/components/messages/AnonymousMessagesView';

export default function SchoolAdminAnonymousMessagesPage() {
  // return <AnonymousMessagesView />;
  return (
    <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center max-w-lg mx-auto my-12 shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 mb-4">
        💬
      </div>
      <h3 className="text-base font-bold text-brand-navy">Module Temporarily Disabled</h3>
      <p className="mt-1.5 text-xs text-text-secondary leading-relaxed">
        Anonymous student messages are currently paused for school administrators. This module will be re-enabled soon.
      </p>
    </div>
  );
}
