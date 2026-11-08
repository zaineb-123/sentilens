import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/cn";
export const Tabs = TabsPrimitive.Root;
export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) { return <TabsPrimitive.List className={cn("inline-flex gap-1 rounded-xl bg-slate-100 p-1", className)} {...props} />; }
export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return <TabsPrimitive.Trigger className={cn("rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors", "data-[state=active]:bg-white/10 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm", className)} {...props} />;
}
export const TabsContent = TabsPrimitive.Content;
