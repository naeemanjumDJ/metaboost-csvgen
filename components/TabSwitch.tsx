import { cn } from "@/lib/utils";
import React, { useState, useMemo } from "react";

interface TabOption {
  value: string;
  label: string;
}

interface TabSwitch {
  options: TabOption[];
  onChange: (selectedValue: string) => void;
  defaultValue?: string;
}

const TabSwitch: React.FC<TabSwitch> = ({
  options,
  onChange,
  defaultValue,
}) => {
  const [selectedTab, setSelectedTab] = useState<string>(
    defaultValue || options[0].value,
  );

  const handleOptionClick = (value: string) => {
    if (value !== selectedTab) {
      setSelectedTab(value);
      onChange(value);
    }
  };

  const optionWidth = useMemo(() => 100 / options.length, [options.length]);

  return (
    <div className="relative h-14 cursor-pointer select-none whitespace-nowrap rounded-full bg-black/10 px-1 text-sm">
      <div
        className="relative z-10 grid h-full items-center gap-1 font-medium text-black/60"
        style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
      >
        {options.map((option) => (
          <div
            key={option.value}
            className={cn(
              "flex h-[calc(100%-8px)] cursor-pointer items-center justify-center rounded-full px-5 transition-colors",
              selectedTab === option.value ? "text-black" : "hover:bg-gray-50/30",
            )}
            onClick={() => handleOptionClick(option.value)}
          >
            {option.label}
          </div>
        ))}
      </div>
      <div
        className={cn(
          "pointer-events-none absolute top-1/2 h-[calc(100%-8px)] -translate-y-1/2 rounded-full bg-white transition-all",
        )}
        style={{
          width: `calc(${optionWidth}% - 8px)`,
          left: `calc(${options.findIndex((opt) => opt.value === selectedTab) * optionWidth}% + 4px)`,
        }}
      ></div>
    </div>
  );
};

export default TabSwitch;
