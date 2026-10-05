import { icons, FileText } from "lucide-react";

// Lucide icons by their kebab-case name, the same names the design system uses. Server only: it pulls in every icon.
export default function Icon({ name, size = 16, strokeWidth = 1.75, className }) {
  const key = String(name || "").replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
  const Cmp = icons[key] || FileText;
  return <Cmp size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />;
}
