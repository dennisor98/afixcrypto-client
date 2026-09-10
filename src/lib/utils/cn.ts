// Accepts any falsy value, not just false, because a guard like
// `count && "px-2"` yields 0 and `node && "pr-16"` can yield 0 or 0n.
// Only non-empty strings survive into the final class list.
type ClassValue = string | number | bigint | boolean | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes
    .filter((c): c is string => typeof c === 'string' && c.length > 0)
    .join(' ');
}