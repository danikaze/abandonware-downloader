export function toCamelCase(str: string): string {
  return str.toLowerCase()
            .replace(/\s+(\S)/, (all, letter) => letter.toUpperCase());
}
