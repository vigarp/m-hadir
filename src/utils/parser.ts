export interface ParsedStudent {
  nim: string;
  name: string;
}

export function parseExcelStudentText(rawText: string): ParsedStudent[] {
  const text = rawText.trim();
  if (!text) return [];

  const lines = text.split(/\r?\n/);
  const results: ParsedStudent[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect delimiter: tab (Excel default), semicolon, or comma
    let parts: string[] = [];
    if (trimmed.includes('\t')) {
      parts = trimmed.split('\t');
    } else if (trimmed.includes(';')) {
      parts = trimmed.split(';');
    } else if (trimmed.includes(',')) {
      parts = trimmed.split(',');
    } else {
      // Fallback: match first word as NIM (alphanumeric/digit) and remainder as Name
      const match = trimmed.match(/^([a-zA-Z0-9_-]+)\s+(.+)$/);
      if (match) {
        parts = [match[1], match[2]];
      }
    }

    if (parts.length >= 2) {
      let nim = parts[0].trim().replace(/^['"`]+|['"`]+$/g, '');
      let name = parts.slice(1).join(' ').trim().replace(/^['"`]+|['"`]+$/g, '');

      // Check if this row is just the table header (e.g. "NIM", "NAMA")
      const isHeader =
        nim.toLowerCase().includes('nim') ||
        name.toLowerCase().includes('nama') ||
        nim.toLowerCase() === 'no' ||
        nim.toLowerCase() === 'id';

      // If column order was reversed (Name first, numeric NIM second)
      if (/^\d{6,}$/.test(name) && !/^\d{6,}$/.test(nim)) {
        const temp = nim;
        nim = name;
        name = temp;
      }

      if (!isHeader && nim && name) {
        results.push({ nim, name });
      }
    }
  }

  return results;
}

