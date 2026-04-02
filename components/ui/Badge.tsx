import { cn } from "@/lib/cn";

const variants = {
  green:  "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  gray:   "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
  blue:   "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  yellow: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  red:    "bg-red-50 text-red-600 ring-1 ring-red-200",
};

interface BadgeProps {
  variant?: keyof typeof variants;
  className?: string;
  children: React.ReactNode;
}

export default function Badge({ variant = "gray", className, children }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
