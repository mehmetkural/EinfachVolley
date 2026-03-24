import { HTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "elevated" | "outlined";
}

export function Card({ children, className, variant = "default", ...props }: CardProps) {
  const variants = {
    default: "bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-5 shadow-sm",
    elevated: "bg-surface-container-lowest dark:bg-surface-container rounded-3xl p-6 shadow-md",
    outlined: "bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-5 border border-outline-variant/30",
  };

  return (
    <div className={clsx(variants[variant], className)} {...props}>
      {children}
    </div>
  );
}
