"use client";

import { useMemo, type Ref } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

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
  ref?: Ref<HTMLInputElement>;
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
  const selected = useMemo(() => options.find((option) => option.value === value) ?? null, [options, value]);

  return (
    <Combobox
      items={options}
      value={selected}
      onValueChange={(option) => onChange(option ? option.value : "")}
      itemToStringLabel={(option) => option?.label ?? ""}
      isItemEqualToValue={(a, b) => a?.value === b?.value}
      filter={
        searchable
          ? (option: SelectOption, query) =>
              `${option.label} ${option.keywords ?? ""}`.toLowerCase().includes(query.trim().toLowerCase())
          : null
      }
    >
      <ComboboxInput
        id={id}
        ref={ref}
        readOnly={!searchable}
        placeholder={searchable ? searchPlaceholder : placeholder}
        aria-label={searchable ? searchPlaceholder : placeholder}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        showClear={Boolean(value)}
        className="h-11 w-full text-base [&_input]:h-11 [&_input]:text-base"
      />
      <ComboboxContent>
        <ComboboxList>
          {(option: SelectOption) => (
            <ComboboxItem key={option.value} value={option} className="min-h-11 py-2.5">
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>Nessun risultato.</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}
