import { ContentLibraryPanel } from '@/components/demo/ContentLibraryPanel';
import { PageHeader } from '@/components/ui/PageHeader';

export default function LecturerContentPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Content Upload"
        subtitle="Upload lecture notes, reading packs, and supplemental resources through a cleaner demo-ready interface."
      />
      <ContentLibraryPanel />
    </div>
  );
}
