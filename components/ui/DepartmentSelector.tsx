'use client';

import { useState } from 'react';
import { Check, Plus, X, Building } from 'lucide-react';

const COMMON_DEPARTMENTS = [
  'Computer Science',
  'Software Engineering',
  'Cybersecurity',
  'Data Science',
  'Electrical & Electronic Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Medicine & Surgery',
  'Nursing',
  'Pharmacy',
  'Biochemistry',
  'Law',
  'International Relations',
  'Mass Communication',
  'Accounting',
  'Economics',
  'Business Administration',
  'Finance',
];

interface DepartmentSelectorProps {
  selectedDepartments: string[];
  onChange: (deps: string[]) => void;
}

export function DepartmentSelector({ selectedDepartments, onChange }: DepartmentSelectorProps) {
  const [customInput, setCustomInput] = useState('');

  const toggleDepartment = (dep: string) => {
    if (selectedDepartments.includes(dep)) {
      onChange(selectedDepartments.filter((d) => d !== dep));
    } else {
      onChange([...selectedDepartments, dep]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;

    if (!selectedDepartments.includes(trimmed)) {
      onChange([...selectedDepartments, trimmed]);
    }
    setCustomInput('');
  };

  const removeDepartment = (dep: string) => {
    onChange(selectedDepartments.filter((d) => d !== dep));
  };

  return (
    <div className="space-y-4 rounded-2xl border border-[#edf0fb] bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
            <Building className="h-4 w-4 text-brand-navy" />
            Institutional Departments
          </h3>
          <p className="mt-1 text-xs text-text-secondary">
            Select standard departments for this campus or type a custom department name.
          </p>
        </div>
        <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-[11px] font-bold text-brand-navy">
          {selectedDepartments.length} Selected
        </span>
      </div>

      {/* Selected Departments Chips */}
      {selectedDepartments.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-xl bg-surface p-3 border border-brand-navy/10">
          {selectedDepartments.map((dep) => (
            <span
              key={dep}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-navy px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
            >
              <span>{dep}</span>
              <button
                type="button"
                onClick={() => removeDepartment(dep)}
                className="rounded-full p-0.5 hover:bg-white/20"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add Custom Department Input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddCustom(e);
          }}
          placeholder="Type custom department name (e.g. Mechatronics Engineering)..."
          className="h-10 flex-1 rounded-xl border border-[#edf0fb] bg-[#fafbff] px-3.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-navy"
        />
        <button
          type="button"
          onClick={handleAddCustom}
          className="inline-flex h-10 items-center justify-center gap-1 rounded-xl bg-brand-gold px-4 text-xs font-bold text-brand-navy hover:bg-brand-gold-light transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Custom
        </button>
      </div>

      {/* Common Preset Departments Grid */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted mb-2">
          Select Common Departments
        </p>
        <div className="flex flex-wrap gap-2">
          {COMMON_DEPARTMENTS.map((dep) => {
            const isSelected = selectedDepartments.includes(dep);
            return (
              <button
                key={dep}
                type="button"
                onClick={() => toggleDepartment(dep)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-brand-navy text-white shadow-sm'
                    : 'border border-[#edf0fb] bg-[#fafbff] text-text-secondary hover:border-brand-navy/30 hover:bg-white hover:text-brand-navy'
                }`}
              >
                {isSelected && <Check className="h-3.5 w-3.5 text-brand-gold" />}
                <span>{dep}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
