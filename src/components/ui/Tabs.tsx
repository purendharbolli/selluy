import React from 'react';
import { motion } from 'framer-motion';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  layoutId?: string;
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Modern motion.dev + Kokonut UI sliding tab indicator using Framer Motion layoutId.
 */
export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  layoutId = 'activeTabIndicator',
  className = '',
  size = 'md',
}: TabsProps<T>) {
  const containerPadding = size === 'sm' ? 'p-1' : 'p-1.5';
  const itemPadding = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-xs sm:text-sm';

  return (
    <div
      className={`inline-flex items-center rounded-2xl bg-sand-200/60 border border-sand-300/60 ${containerPadding} ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative ${itemPadding} rounded-xl font-bold transition-colors select-none flex items-center gap-2 cursor-pointer z-10 ${
              isActive ? 'text-stone-950' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 bg-white rounded-xl shadow-xs border border-sand-300/40"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                style={{ zIndex: -1 }}
              />
            )}
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-sand-300/60 text-stone-600'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
