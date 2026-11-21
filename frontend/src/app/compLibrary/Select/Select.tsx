"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, options, className = "", id, name, ...props },
  ref,
) {
  const selectId = id ?? name;

  return (
    <div className="w-full">
      {label && (
        <label className="label" htmlFor={selectId}>
          {label}
        </label>
      )}
      <select
        {...props}
        ref={ref}
        id={selectId}
        name={name}
        aria-invalid={Boolean(error)}
        className={`input ${error ? "!border-danger" : ""} ${className}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
