"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  rightSlot?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, rightSlot, className = "", id, name, ...props },
  ref,
) {
  const inputId = id ?? name;

  return (
    <div className="w-full">
      {label && (
        <label className="label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          ref={ref}
          id={inputId}
          name={name}
          aria-invalid={Boolean(error)}
          className={`input ${error ? "!border-danger focus:!ring-danger/20" : ""} ${rightSlot ? "pr-11" : ""} ${className}`}
        />
        {rightSlot && (
          <div className="absolute inset-y-0 right-2 flex items-center">{rightSlot}</div>
        )}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
});
