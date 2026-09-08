"use client";

import { forwardRef, useId, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { fieldBase, FieldChrome, type FieldWrapperProps } from "./Input";
import { getPasswordStrength } from "@/lib/utils/passwordStrength";

export interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement>, FieldWrapperProps {
  showStrength?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, hint, required, id, showStrength, value, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const [visible, setVisible] = useState(false);
    const strength = showStrength ? getPasswordStrength(String(value ?? "")) : null;

    return (
      <FieldChrome label={label} error={error} hint={hint} required={required} id={fieldId}>
        <div className="relative">
          <input
            ref={ref}
            id={fieldId}
            type={visible ? "text" : "password"}
            value={value}
            className={cn(fieldBase, "pr-11", error && "border-danger focus:ring-danger focus:border-danger", className)}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
          >
            {visible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        {showStrength && strength && String(value ?? "").length > 0 && (
          <div className="mt-2">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn("h-1.5 flex-1 rounded-full bg-ink-100", i <= strength.score && strength.color)}
                />
              ))}
            </div>
            <p className={cn("mt-1 text-xs font-medium", strength.score <= 1 ? "text-danger" : strength.score === 2 ? "text-sun-500" : "text-mint-700")}>
              {strength.label}
            </p>
          </div>
        )}
      </FieldChrome>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
