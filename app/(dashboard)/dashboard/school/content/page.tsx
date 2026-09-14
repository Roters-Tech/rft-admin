import { ContentLibraryPanel } from '@/components/demo/ContentLibraryPanel';
import { PageHeader } from '@/components/ui/PageHeader';

export default function SchoolContentPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Institutional Content"
        subtitle="A school-specific repository for lecture packs, notices, and policy updates."
      />
      <ContentLibraryPanel />
    </div>
  );
}
