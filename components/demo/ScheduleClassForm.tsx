'use client';

import { CalendarClock, MapPin, Video } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { FormField } from '@/components/ui/FormField';
import { Panel } from '@/components/ui/Panel';
import { SelectField } from '@/components/ui/SelectField';

export function ScheduleClassForm() {
  return (
    <Panel
      title="Schedule a Class Session"
      subtitle="Mock scheduling flow for your demo. All values are ready to be replaced by API calls later."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Course Code" placeholder="CS101" icon={<CalendarClock className="h-4 w-4" />} />
        <FormField label="Venue / Link" placeholder="Engineering Hall A / Zoom Link" icon={<MapPin className="h-4 w-4" />} />
        <FormField label="Date" placeholder="2026-04-15" type="date" />
        <FormField label="Time" placeholder="13:00" type="time" />
        <SelectField label="Delivery Mode" options={['Physical Class', 'Hybrid Session', 'Virtual Session']} defaultValue="Physical Class" />
        <SelectField label="Notify Audience" options={['Entire Class', 'Class Reps Only', 'Registered Students + Reps']} defaultValue="Registered Students + Reps" />
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <AppButton toastMessage="Class scheduled and student notifications queued.">
          <Video className="h-4 w-4" />
          Schedule Session
        </AppButton>
        <AppButton variant="secondary" toastMessage="Timetable draft saved.">
          Save Draft
        </AppButton>
      </div>
    </Panel>
  );
}
