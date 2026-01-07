'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TabProps {
  title: React.ReactNode;
  children: React.ReactNode;
}

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}

interface TabsProps {
  activeKey: string;
  onChange: (params: { activeKey: string }) => void;
  activateOnFocus?: boolean;
  disabled?: boolean;
  children: React.ReactElement<TabProps> | React.ReactElement<TabProps>[];
}

export function Tabs({ activeKey, onChange, activateOnFocus, disabled, children }: TabsProps) {
  const tabs = React.Children.toArray(children) as React.ReactElement<TabProps>[];
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex relative">
        {tabs.map((tab, index) => {
          const key = String(index);
          const isActive = activeKey === key;
          const isHovered = hoveredIndex === index;

          return (
            <button
              key={key}
              onClick={() => !disabled && onChange({ activeKey: key })}
              onFocus={() => activateOnFocus && !disabled && onChange({ activeKey: key })}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              disabled={disabled}
              className={`relative h-[46px] px-4 py-2 flex items-center justify-center font-medium text-[13px] leading-5 tracking-[-0.078px] transition-colors duration-200 whitespace-nowrap ${
                isActive
                  ? 'text-[#171717] border-b-[3px] border-[#171717]'
                  : disabled
                  ? 'text-[#d1d1d1] cursor-not-allowed'
                  : isHovered
                  ? 'text-[#a3a3a3] bg-[#ebebeb]'
                  : 'text-[#a3a3a3] cursor-pointer'
              }`}
            >
              {/* Tab title */}
              <span className="relative z-10">{tab.props.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
