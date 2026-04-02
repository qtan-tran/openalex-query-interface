import { cn } from "@/lib/cn";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export default function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
