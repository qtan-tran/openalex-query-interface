import { cn } from "@/lib/cn";

const variants = {
  primary: "bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50",
  outline: "border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50",
  ghost:   "text-gray-600 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50",
  danger:  "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
}

export default function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
