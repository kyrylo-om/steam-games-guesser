export function cn(...inputs: (string | null | undefined | boolean)[]): string {
  return inputs.filter(Boolean).join(" ");
}
