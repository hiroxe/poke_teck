import { useState, useRef, useEffect } from "react";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string | string[];
  onChange: (value: string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  multiple = false,
  placeholder = "Select...",
  className = "",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isSelected = (val: string) =>
    multiple ? (value as string[]).includes(val) : value === val;

  const toggleValue = (val: string) => {
    if (!multiple) return onChange([val]);

    const arr = value as string[];
    onChange(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  // click fuera → cerrar
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabels = multiple
    ? options
        .filter((o) => (value as string[]).includes(o.value))
        .map((o) => o.label)
        .join(", ")
    : options.find((o) => o.value === value)?.label;

  return (
    <div className={`relative w-52 ${className}`} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm shadow-sm hover:border-gray-400 focus:border-blue-400 focus:outline-none"
      >
        {selectedLabels ? (
          <span className="truncate">{selectedLabels}</span>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <span className="ml-2 text-gray-500">▾</span>
      </button>

      {open && (
        <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
            >
              {multiple && (
                <input
                  type="checkbox"
                  checked={isSelected(opt.value)}
                  onChange={() => toggleValue(opt.value)}
                />
              )}
              {!multiple && (
                <input
                  type="radio"
                  checked={isSelected(opt.value)}
                  onChange={() => toggleValue(opt.value)}
                />
              )}
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
