import { ContentLibraryPanel } from '@/components/demo/ContentLibraryPanel';
import { PageHeader } from '@/components/ui/PageHeader';

export default function SuperContentPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform Content"
        subtitle="A cleaner control surface for platform-wide guides, academic policies, and reusable admin resources."
      />
      <ContentLibraryPanel />
    </div>
  );
}
