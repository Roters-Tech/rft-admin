'use client';

import { Building2, MapPin, ShieldCheck } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { FormField } from '@/components/ui/FormField';
import { Panel } from '@/components/ui/Panel';
import { SelectField } from '@/components/ui/SelectField';

export function SchoolOnboardingForm() {
  return (
    <Panel
      title="Onboard a New School"
      subtitle="Capture the institution profile, academic structure, and admin ownership so the platform is ready for API integration later."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="School Name" placeholder="RFT Northern Campus" icon={<Building2 className="h-4 w-4" />} />
        <FormField label="Primary Location" placeholder="Kaduna, Nigeria" icon={<MapPin className="h-4 w-4" />} />
        <FormField label="Lead Administrator" placeholder="Dr. Zara Thomas" icon={<ShieldCheck className="h-4 w-4" />} />
        <FormField label="Institutional Email" placeholder="admin@northerncampus.edu" />
        <SelectField label="Student Capacity" options={['2,500', '5,000', '10,000', '20,000+']} defaultValue="5,000" />
        <SelectField label="Default Status" options={['Optimal', 'Growing', 'Critical']} defaultValue="Growing" />
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <AppButton toastMessage="School draft created successfully.">Create School Draft</AppButton>
        <AppButton variant="secondary" toastMessage="Checklist saved for later review.">
          Save Checklist
        </AppButton>
      </div>
    </Panel>
  );
}
