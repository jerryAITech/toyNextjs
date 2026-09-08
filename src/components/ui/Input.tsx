import { forwardRef, useId, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const fieldBase =
  "w-full rounded-2xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 " +
  "focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors disabled:bg-ink-50 disabled:text-ink-400";

export interface FieldWrapperProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  id?: string;
}

export function FieldChrome({ label, error, hint, required, id, children }: FieldWrapperProps & { children: React.ReactNode }) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label} {required && <span className="text-accent-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1 text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, FieldWrapperProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, required, id, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    return (
      <FieldChrome label={label} error={error} hint={hint} required={required} id={fieldId}>
        <input
          ref={ref}
          id={fieldId}
          className={cn(fieldBase, error && "border-danger focus:ring-danger focus:border-danger", className)}
          {...props}
        />
      </FieldChrome>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldWrapperProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, required, id, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    return (
      <FieldChrome label={label} error={error} hint={hint} required={required} id={fieldId}>
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          className={cn(fieldBase, "resize-none", error && "border-danger focus:ring-danger focus:border-danger", className)}
          {...props}
        />
      </FieldChrome>
    );
  }
);
Textarea.displayName = "Textarea";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, FieldWrapperProps {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, required, id, children, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    return (
      <FieldChrome label={label} error={error} hint={hint} required={required} id={fieldId}>
        <div className="relative">
          <select
            ref={ref}
            id={fieldId}
            className={cn(fieldBase, "appearance-none pr-9", error && "border-danger focus:ring-danger focus:border-danger", className)}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
        </div>
      </FieldChrome>
    );
  }
);
Select.displayName = "Select";
