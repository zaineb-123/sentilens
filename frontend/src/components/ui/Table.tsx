import { cn } from "@/lib/cn";
import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) { return <div className="w-full overflow-x-auto rounded-xl border border-border bg-white/[0.03]"><table className={cn("w-full text-left text-sm", className)} {...props} /></div>; }
export function Thead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) { return <thead className={cn("bg-slate-50 text-xs uppercase tracking-wide text-slate-500", className)} {...props} />; }
export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) { return <th className={cn("px-4 py-3 font-medium", className)} {...props} />; }
export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) { return <td className={cn("px-4 py-3 text-slate-700", className)} {...props} />; }
export function Tr({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) { return <tr className={cn("border-t border-border first:border-t-0", className)} {...props} />; }
