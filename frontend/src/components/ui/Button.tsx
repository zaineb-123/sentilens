import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";
const variantClasses: Record<Variant, string> = {
  primary: "bg-gradient-to-br from-primary to-mixed text-white btn-glow hover:-translate-y-px hover:brightness-110",
  secondary: "bg-white/10 text-slate-900 hover:bg-white/15",
  outline: "border border-border bg-white/5 text-slate-700 hover:bg-white/10 hover:text-slate-900",
  ghost: "text-slate-600 hover:bg-white/10 hover:text-slate-900",
  danger: "bg-gradient-to-br from-red-500 to-rose-600 text-white hover:brightness-110",
};
const sizeClasses: Record<Size, string> = { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm", lg: "h-11 px-5 text-base" };

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: Size; loading?: boolean; }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref} disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant], sizeClasses[size], className,
      )}
      {...props}
    >
      {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
