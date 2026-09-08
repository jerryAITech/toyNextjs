export function toCSV(rows: Record<string, unknown>[], columns?: string[]): string {
  if (rows.length === 0) return "";
  const cols = columns ?? Object.keys(rows[0]);

  const escape = (value: unknown) => {
    const str = value === null || value === undefined ? "" : String(value);
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };

  const header = cols.map(escape).join(",");
  const body = rows.map((row) => cols.map((c) => escape(row[c])).join(",")).join("\n");
  return `${header}\n${body}`;
}
