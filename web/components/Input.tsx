import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-bold text-secondary dark:text-outline-variant uppercase tracking-widest mb-2"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={clsx(
            "w-full px-4 py-3 rounded-xl text-sm font-medium transition-all",
            "bg-surface-container-low dark:bg-surface-container",
            "text-on-surface dark:text-on-surface",
            "placeholder:text-outline-variant",
            error
              ? "ring-2 ring-error focus:ring-error"
              : "focus:ring-2 focus:ring-primary focus:outline-none",
            "border-none",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
