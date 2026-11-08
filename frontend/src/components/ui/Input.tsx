import { forwardRef, type InputHTMLAttributes, type LabelHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("h-10 w-full rounded-xl border border-border bg-white/5 px-3 text-sm text-slate-900 placeholder:text-slate-400", "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary-400 disabled:opacity-50", className)} {...props} />
));
Input.displayName = "Input";
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn("w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400", "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary-400", className)} {...props} />
));
Textarea.displayName = "Textarea";
export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) { return <label className={cn("mb-1.5 block text-sm font-medium text-slate-700", className)} {...props} />; }
export function FieldError({ children }: { children?: string }) { if (!children) return null; return <p className="mt-1 text-xs text-negative-600">{children}</p>; }
