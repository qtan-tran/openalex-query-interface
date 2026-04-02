/** Joins truthy class strings. Lightweight alternative to clsx. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
