import { SchoolBillingPanel } from '@/components/school/SchoolBillingPanel';
import { PageHeader } from '@/components/ui/PageHeader';

export default function SchoolBillingPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Billing & Subscription"
        subtitle="Manage your institution's access plan, view student capacity limits, and upgrade via Paystack."
      />
      <SchoolBillingPanel />
    </div>
  );
}
