'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export interface SearchableOption {
  value: string;
  label: string;
  category?: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SearchableOption[];
  placeholder?: string;
  label?: string;
  required?: boolean;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Search or select...',
  label,
  required = false,
  emptyText = 'No matching options found',
  disabled = false,
  className = '',
  size = 'md',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === value);
  }, [options, value]);

  // Filter options based on user typing
  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.category && opt.category.toLowerCase().includes(q)) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
    );
  }, [options, searchQuery]);

  const handleToggleOpen = () => {
    if (disabled) return;
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setSearchQuery('');
        setHighlightedIndex(0);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      return next;
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setHighlightedIndex(0);
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % (filteredOptions.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + (filteredOptions.length || 1)) % (filteredOptions.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex].value);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggleOpen}
        className={`w-full ${size === 'sm' ? 'h-9 px-3 text-xs' : 'h-11 px-3.5 text-xs'} flex items-center justify-between rounded-xl border bg-surface text-left transition-all ${
          isOpen
            ? 'border-brand-navy ring-2 ring-brand-navy/10 bg-white'
            : 'border-gray-200 hover:border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'cursor-pointer'}`}
      >
        <div className="truncate pr-2">
          {selectedOption ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-brand-navy truncate">{selectedOption.label}</span>
              {selectedOption.category && (
                <span className="text-[10px] font-semibold text-text-muted bg-gray-100 px-2 py-0.5 rounded-md truncate shrink-0">
                  {selectedOption.category}
                </span>
              )}
            </div>
          ) : (
            <span className="text-text-muted">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-brand-navy' : ''
          }`}
        />
      </button>

      {/* Dropdown Card */}
      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-2xl border border-gray-100 bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden animate-fade-in">
          {/* Search Box Input */}
          <div className="p-2 border-b border-gray-100 bg-gray-50/70">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-3.5 w-3.5 text-gray-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                placeholder="Type to filter..."
                className="w-full h-9 pl-9 pr-8 rounded-lg border border-gray-200 bg-white text-xs text-text-primary outline-none focus:border-brand-navy placeholder:text-gray-400 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setHighlightedIndex(0);
                  }}
                  className="absolute right-2.5 p-0.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-text-muted">
                {emptyText}
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = opt.value === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-brand-navy/10 text-brand-navy font-bold'
                        : isHighlighted
                        ? 'bg-gray-100 text-brand-navy'
                        : 'text-text-primary hover:bg-surface'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-semibold text-text-primary truncate">{opt.label}</div>
                      {(opt.category || opt.sublabel) && (
                        <div className="text-[10px] text-text-secondary truncate mt-0.5">
                          {opt.category} {opt.sublabel ? `• ${opt.sublabel}` : ''}
                        </div>
                      )}
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-brand-navy shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
