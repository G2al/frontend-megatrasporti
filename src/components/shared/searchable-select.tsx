"use client";

import { useMemo, useState, type Ref } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  keywords?: string;
}

interface SearchableSelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  searchPlaceholder?: string;
  searchable?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  ref?: Ref<HTMLSelectElement>;
}

export function SearchableSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder = "Cerca...",
  searchable = true,
  invalid,
  disabled,
  ref,
}: SearchableSelectProps) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter(
      (option) =>
        option.value === value ||
        `${option.label} ${option.keywords ?? ""}`.toLowerCase().includes(needle),
    );
  }, [options, query, value]);

  return (
    <div className="space-y-2">
      {searchable && (
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            disabled={disabled}
            className="h-11 pl-9"
          />
        </div>
      )}
      <div className="relative">
        <select
          id={id}
          ref={ref}
          value={value}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "h-11 w-full appearance-none truncate rounded-lg border border-input bg-background pr-10 pl-3 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            invalid && "border-destructive ring-3 ring-destructive/20",
            !value && "text-muted-foreground",
          )}
        >
          <option value="">{placeholder}</option>
          {visible.map((option) => (
            <option key={option.value} value={option.value} className="text-foreground">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </div>
    </div>
  );
}
