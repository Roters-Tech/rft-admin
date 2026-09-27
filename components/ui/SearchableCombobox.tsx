'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown, Check, Plus, X } from 'lucide-react';

export interface ComboboxOption {
  value: string;
  label: string;
  category?: string;
  description?: string;
}

interface SearchableComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | ComboboxOption)[];
  placeholder?: string;
  label?: string;
  required?: boolean;
  allowCustom?: boolean;
  customPromptText?: string;
  emptyText?: string;
  disabled?: boolean;
}

export function SearchableCombobox({
  value,
  onChange,
  options,
  placeholder = 'Search or select...',
  label,
  required = false,
  allowCustom = true,
  customPromptText = 'Use custom',
  emptyText = 'No matching options found',
  disabled = false,
}: SearchableComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Synchronize internal search term with external value
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  // Normalize options into ComboboxOption objects
  const normalizedOptions: ComboboxOption[] = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    const trimmed = searchTerm.trim().toLowerCase();
    if (!trimmed) {
      return normalizedOptions;
    }
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(trimmed) ||
        opt.category?.toLowerCase().includes(trimmed) ||
        opt.description?.toLowerCase().includes(trimmed)
    );
  }, [normalizedOptions, searchTerm]);

  // Check if current search matches an existing option exactly
  const exactMatch = useMemo(() => {
    const trimmed = searchTerm.trim().toLowerCase();
    return normalizedOptions.some((opt) => opt.value.toLowerCase() === trimmed);
  }, [normalizedOptions, searchTerm]);

  // Reset highlighted index when filtered list changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions]);

  // Handle outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSelectOption = (optValue: string) => {
    onChange(optValue);
    setSearchTerm(optValue);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleCustomAdd = () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    onChange(trimmed);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    const totalItems = filteredOptions.length + (allowCustom && searchTerm.trim() && !exactMatch ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % (totalItems || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + (totalItems || 1)) % (totalItems || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex < filteredOptions.length) {
        const chosen = filteredOptions[highlightedIndex];
        if (chosen) handleSelectOption(chosen.value);
      } else if (allowCustom && searchTerm.trim() && !exactMatch) {
        handleCustomAdd();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full space-y-1">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <div
          className={`flex items-center rounded-xl border bg-white px-3 py-2 text-xs transition-all ${
            isOpen
              ? 'border-brand-navy ring-2 ring-brand-navy/10'
              : 'border-gray-200 hover:border-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
        >
          <Search className="mr-2 h-3.5 w-3.5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            disabled={disabled}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onChange(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => {
              if (!disabled) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent text-xs text-text-primary placeholder:text-gray-400 focus:outline-none"
          />

          {searchTerm && !disabled ? (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                onChange('');
                inputRef.current?.focus();
              }}
              className="rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => {
                if (!disabled) {
                  setIsOpen((prev) => !prev);
                  inputRef.current?.focus();
                }
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Dropdown menu */}
        {isOpen && !disabled && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5 animate-fade-in">
            {filteredOptions.length === 0 && (!allowCustom || !searchTerm.trim() || exactMatch) ? (
              <div className="py-4 text-center text-xs text-gray-400">
                {emptyText}
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredOptions.map((opt, index) => {
                  const isSelected = value?.toLowerCase() === opt.value.toLowerCase();
                  const isHighlighted = index === highlightedIndex;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectOption(opt.value)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                        isHighlighted
                          ? 'bg-brand-navy/10 text-brand-navy font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="truncate">{opt.label}</span>
                        {opt.category && (
                          <span className="ml-2 text-[10px] text-gray-400 font-normal">
                            ({opt.category})
                          </span>
                        )}
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-brand-navy shrink-0" />}
                    </button>
                  );
                })}

                {/* Custom Option Prompt */}
                {allowCustom && searchTerm.trim() && !exactMatch && (
                  <button
                    type="button"
                    onClick={handleCustomAdd}
                    onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
                    className={`flex w-full items-center gap-2 rounded-lg border border-dashed border-brand-navy/20 px-2.5 py-2 text-left text-xs transition-colors ${
                      highlightedIndex === filteredOptions.length
                        ? 'bg-brand-navy/10 text-brand-navy font-bold'
                        : 'bg-surface text-brand-navy hover:bg-brand-navy/5 font-semibold'
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5 text-brand-gold shrink-0" />
                    <span className="truncate">
                      {customPromptText}: &ldquo;<span className="font-bold text-brand-navy">{searchTerm.trim()}</span>&rdquo;
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
