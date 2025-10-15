// src/frontend/src/utils/csvParser.ts
import Papa from 'papaparse';

export interface StartupInviteRow {
  startup_name: string;
  email: string;
  expiry_days?: number | null;
  _rowNumber?: number; // added for UI mapping
}

export interface CSVError {
  row: number;
  field: string;
  message: string;
}

export interface ParsedCSV {
  data: StartupInviteRow[];
  errors: CSVError[];
}

/**
 * Validate email with a conservative regex.
 */
function isValidEmail(email: string) {
  // simple, conservative RFC-like check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function generateCSVTemplate(): void {
  const csv = 'startup_name,email,expiry_days\nExample Startup,founder@example.com,7\n';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'startup-invite-template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function parseStartupInviteCSV(file: File, maxRows = 100): Promise<ParsedCSV> {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided'));
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return reject(new Error('File must be .csv'));
    }
    if (file.size > 5 * 1024 * 1024) {
      return reject(new Error('File too large. Max 5MB'));
    }

    const errors: CSVError[] = [];
    const data: StartupInviteRow[] = [];
    let rowIndex = 0;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, string>[];
        if (rows.length === 0) {
          return resolve({ data: [], errors: [{ row: 0, field: 'file', message: 'CSV is empty' }] });
        }
        if (rows.length > maxRows) {
          errors.push({ row: 0, field: 'file', message: `Too many rows (max ${maxRows})` });
        }

        const seenEmails = new Map<string, number>(); // email -> firstRow
        rows.forEach((r, i) => {
          rowIndex = i + 1; // 1-based
          const startup_name = (r['startup_name'] || r['Startup Name'] || '').trim();
          const email = (r['email'] || r['Email'] || '').trim();
          const expiry_raw = (r['expiry_days'] || r['Expiry Days'] || '').trim();

          const row: StartupInviteRow = { startup_name, email, _rowNumber: rowIndex };

          // Required fields
          if (!startup_name) {
            errors.push({ row: rowIndex, field: 'startup_name', message: 'startup_name is required' });
          }
          if (!email) {
            errors.push({ row: rowIndex, field: 'email', message: 'email is required' });
          } else if (!isValidEmail(email)) {
            errors.push({ row: rowIndex, field: 'email', message: 'email is invalid' });
          }

          // expiry_days parse
          let expiry_days: number | null = null;
          if (expiry_raw) {
            const n = Number(expiry_raw);
            if (!Number.isFinite(n) || n < 0) {
              errors.push({ row: rowIndex, field: 'expiry_days', message: 'expiry_days must be a positive integer' });
            } else {
              expiry_days = Math.floor(n);
              row.expiry_days = expiry_days;
            }
          }

          // duplicate check within CSV
          if (email) {
            const lower = email.toLowerCase();
            if (seenEmails.has(lower)) {
              errors.push({
                row: rowIndex,
                field: 'email',
                message: `Duplicate email (first seen on row ${seenEmails.get(lower)})`,
              });
            } else {
              seenEmails.set(lower, rowIndex);
            }
          }

          data.push(row);
        });

        resolve({ data, errors });
      },
      error: (err) => reject(err),
      transformHeader: (h) => h.trim(),
    });
  });
}
