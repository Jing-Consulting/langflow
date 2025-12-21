export function normalizeString(str: string | null | undefined): string {
  if (str == null) return "";
  return str.toLowerCase().replace(/_/g, " ").replace(/\s+/g, "");
}
