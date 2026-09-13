'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, Globe } from 'lucide-react';

export interface DropdownItem {
  id: string | number;
  name: string;
  flag?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'hot' | 'orange' | 'emerald' | 'sky' | 'purple';
  isPriority?: boolean;
}

interface CustomSearchDropdownProps {
  label: string;
  placeholder: string;
  searchPlaceholder?: string;
  items: DropdownItem[];
  selectedId: string | number | null | undefined;
  onSelect: (item: DropdownItem) => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  prioritySectionTitle?: string;
  allSectionTitle?: string;
  showSearchThreshold?: number;
  accentColor?: 'orange' | 'rose' | 'sky' | 'purple' | 'emerald';
  helperText?: React.ReactNode;
}

export default function CustomSearchDropdown({
  label,
  placeholder,
  searchPlaceholder = 'Search...',
  items,
  selectedId,
  onSelect,
  disabled = false,
  isLoading = false,
  loadingText = 'Loading options...',
  prioritySectionTitle = '⭐ Popular / Recommended',
  allSectionTitle = '🌐 All Options',
  showSearchThreshold = 5,
  accentColor = 'orange',
  helperText,
}: CustomSearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedItem = items.find((item) => String(item.id) === String(selectedId));

  // Dynamic theme accents
  const themeStyles = {
    orange: {
      focusBorder: 'border-brand-orange ring-2 ring-brand-orange/20',
      activeText: 'text-brand-orange',
      activeBg: 'bg-brand-orange/10 text-brand-orange',
      badgeBg: 'bg-brand-orange/20 text-brand-orange',
      dot: 'bg-brand-orange',
      arrow: 'text-brand-orange',
    },
    rose: {
      focusBorder: 'border-rose-500 ring-2 ring-rose-500/20',
      activeText: 'text-rose-600 dark:text-rose-400',
      activeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      badgeBg: 'bg-rose-500/20 text-rose-600 dark:text-rose-400',
      dot: 'bg-rose-500',
      arrow: 'text-rose-500',
    },
    sky: {
      focusBorder: 'border-sky-500 ring-2 ring-sky-500/20',
      activeText: 'text-sky-600 dark:text-sky-400',
      activeBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
      badgeBg: 'bg-sky-500/20 text-sky-600 dark:text-sky-400',
      dot: 'bg-sky-500',
      arrow: 'text-sky-500',
    },
    purple: {
      focusBorder: 'border-purple-500 ring-2 ring-purple-500/20',
      activeText: 'text-purple-600 dark:text-purple-400',
      activeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      badgeBg: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
      dot: 'bg-purple-500',
      arrow: 'text-purple-500',
    },
    emerald: {
      focusBorder: 'border-emerald-500 ring-2 ring-emerald-500/20',
      activeText: 'text-emerald-600 dark:text-emerald-400',
      activeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      dot: 'bg-emerald-500',
      arrow: 'text-emerald-500',
    },
  }[accentColor];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q))
    );
  });

  const priorityItems = filteredItems.filter((item) => item.isPriority);
  const otherItems = filteredItems.filter((item) => !item.isPriority);

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
        {isLoading && (
          <span className={`text-[11px] animate-pulse font-medium ${themeStyles.activeText}`}>
            {loadingText}
          </span>
        )}
      </div>

      <div className="relative">
        {/* Trigger Button with responsive wrapping */}
        <button
          type="button"
          onClick={() => !disabled && !isLoading && setIsOpen((prev) => !prev)}
          disabled={disabled || isLoading}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border transition-all text-left ${
            isOpen
              ? themeStyles.focusBorder
              : 'border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20'
          } ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center gap-2.5 min-w-0 mr-2 flex-1">
            {selectedItem ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {selectedItem.flag ? (
                    <span className="text-base leading-none flex-shrink-0">{selectedItem.flag}</span>
                  ) : null}
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white break-words line-clamp-2">
                    {selectedItem.name}
                  </span>
                  {selectedItem.badge && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-sm shadow-rose-500/30 shrink-0">
                      {selectedItem.badge}
                    </span>
                  )}
                </div>
                {selectedItem.subtitle && (
                  <span className={`text-xs font-bold whitespace-nowrap flex-shrink-0 self-start sm:self-auto ${themeStyles.activeText}`}>
                    {selectedItem.subtitle}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs sm:text-sm text-slate-400 font-normal">
                {isLoading ? loadingText : placeholder}
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-1 ${
              isOpen ? `rotate-180 ${themeStyles.arrow}` : ''
            }`}
          />
        </button>

        {/* Dropdown Menu Popover with Contained Vertical Scroll */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
            {/* Search Input Filter */}
            {items.length >= showSearchThreshold && (
              <div className="p-2.5 border-b border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-slate-950/60">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-brand-orange placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            {/* Scrollable Container with Max Height */}
            <div className="max-h-64 sm:max-h-72 overflow-y-auto p-1.5 divide-y divide-slate-100 dark:divide-white/5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
              {filteredItems.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No matching options found
                </div>
              ) : (
                <>
                  {/* Priority Section */}
                  {priorityItems.length > 0 && (
                    <div className="pb-1.5">
                      <div className={`px-2.5 py-1.5 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 ${themeStyles.activeText}`}>
                        {prioritySectionTitle}
                      </div>
                      <div className="space-y-1">
                        {priorityItems.map((item) => {
                          const isSelected = String(item.id) === String(selectedId);
                          return (
                            <button
                              key={String(item.id)}
                              type="button"
                              onClick={() => {
                                onSelect(item);
                                setIsOpen(false);
                              }}
                              className={`w-full flex items-start justify-between p-2.5 rounded-xl text-left transition-colors text-xs ${
                                isSelected
                                  ? `${themeStyles.activeBg} font-bold`
                                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 font-medium'
                              }`}
                            >
                              <div className="flex items-start gap-2.5 min-w-0 flex-1 mr-2">
                                {item.flag ? (
                                  <span className="text-base leading-none flex-shrink-0 mt-0.5">{item.flag}</span>
                                ) : (
                                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${themeStyles.dot}`} />
                                )}
                                <span className="break-words leading-snug flex-1 flex items-center gap-2">
                                  <span>{item.name}</span>
                                  {item.badge && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-rose-500 text-white shadow-sm shadow-rose-500/25 shrink-0 leading-none">
                                      {item.badge}
                                    </span>
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                {item.subtitle && (
                                  <span className="text-[11px] font-mono font-bold whitespace-nowrap opacity-90">
                                    {item.subtitle}
                                  </span>
                                )}
                                {isSelected && <Check className={`w-4 h-4 flex-shrink-0 ${themeStyles.activeText}`} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* All Other Section */}
                  {otherItems.length > 0 && (
                    <div className="pt-1.5">
                      {priorityItems.length > 0 && (
                        <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          {allSectionTitle}
                        </div>
                      )}
                      <div className="space-y-1">
                        {otherItems.map((item) => {
                          const isSelected = String(item.id) === String(selectedId);
                          return (
                            <button
                              key={String(item.id)}
                              type="button"
                              onClick={() => {
                                onSelect(item);
                                setIsOpen(false);
                              }}
                              className={`w-full flex items-start justify-between p-2.5 rounded-xl text-left transition-colors text-xs ${
                                isSelected
                                  ? `${themeStyles.activeBg} font-bold`
                                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 font-medium'
                              }`}
                            >
                              <div className="flex items-start gap-2.5 min-w-0 flex-1 mr-2">
                                {item.flag ? (
                                  <span className="text-base leading-none flex-shrink-0 mt-0.5">{item.flag}</span>
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0 mt-1.5" />
                                )}
                                <span className="break-words leading-snug flex-1 flex items-center gap-2">
                                  <span>{item.name}</span>
                                  {item.badge && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-rose-500 text-white shadow-sm shadow-rose-500/25 shrink-0 leading-none">
                                      {item.badge}
                                    </span>
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                {item.subtitle && (
                                  <span className="text-[11px] font-mono font-bold whitespace-nowrap opacity-90">
                                    {item.subtitle}
                                  </span>
                                )}
                                {isSelected && <Check className={`w-4 h-4 flex-shrink-0 ${themeStyles.activeText}`} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {helperText && (
        <div className="pt-0.5">
          {helperText}
        </div>
      )}
    </div>
  );
}
