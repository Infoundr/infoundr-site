// src/frontend/src/components/accelerator/BulkInviteUpload.tsx
import React, { useState } from 'react';
import { parseStartupInviteCSV, generateCSVTemplate, ParsedCSV, StartupInviteRow } from '../../utils/csvParser';
import { generateBulkStartupInvites } from '../../services/startup-invite';
import { saveAs } from 'file-saver';

interface Props {
  acceleratorId: string;
  programName: string;
  inviteType: string; // match your InviteType enum representation
  onInvitesParsed?: (parsedInvites: StartupInviteRow[]) => Promise<void>; 
}

export default function BulkInviteUpload({ acceleratorId, programName, inviteType, onInvitesParsed,}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedCSV | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleChooseFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setParsed(null);
    setResult(null);
    if (!f) return;
    try {
      const p = await parseStartupInviteCSV(f);
      setParsed(p);
    } catch (err: any) {
      setError(err.message || String(err));
    }
  }

  async function handleUploadAll() {
    if (!parsed) return;
    const validRows = parsed.data.filter((row) => {
      // a row is valid if there is no error entry with its row number
      return !parsed.errors.some((e) => e.row === row._rowNumber);
    });

    if (validRows.length === 0) {
      setError('No valid rows to upload. Fix errors and re-upload.');
      return;
    }

    const payload = {
      accelerator_id: acceleratorId,
      program_name: programName,
      invite_type: inviteType,
      invites: validRows.map((r) => ({
        startup_name: r.startup_name,
        email: r.email,
        expiry_days: r.expiry_days ?? undefined,
      })),
    };

    try {
      setUploading(true);
      setProgress({ current: 0, total: validRows.length });
      // call backend
      const res = await generateBulkStartupInvites(payload, (progressUpdate?: { current?: number; total?: number }) => {
        if (progressUpdate) setProgress((p) => ({ ...p, ...progressUpdate }));
      });
      setResult(res);
      // optionally, after success, refresh invites table via parent callback or global state
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setUploading(false);
    }
  }

  function downloadFailedCSV() {
    if (!result?.failed?.length) return;
    const header = 'row_number,startup_name,email,error\n';
    const rows = result.failed.map((f: any) => `${f.row_number},"${f.startup_name}","${f.email}","${f.error}"\n`).join('');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    saveAs(blob, 'failed-invites.csv');
  }

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold">📊 Bulk Import Startups</h3>
      <div className="mt-2">
        <button className="btn mr-2" onClick={() => generateCSVTemplate()}>
          Download CSV Template
        </button>
        <input type="file" accept=".csv" onChange={handleChooseFile} className="ml-4" />
      </div>

      {error && <div className="text-red-600 mt-2">{error}</div>}

      {parsed && (
        <div className="mt-4">
          <h4 className="font-medium">Preview ({parsed.data.length} rows)</h4>
          <div style={{ maxHeight: 240, overflow: 'auto' }}>
            <table className="w-full text-sm mt-2">
              <thead>
                <tr><th>#</th><th>Startup</th><th>Email</th><th>Expiry Days</th><th>Errors</th></tr>
              </thead>
              <tbody>
                {parsed.data.map((r) => {
                  const errs = parsed.errors.filter((e) => e.row === r._rowNumber).map(e => `${e.field}: ${e.message}`).join('; ');
                  const isInvalid = errs.length > 0;
                  return (
                    <tr key={r._rowNumber} className={isInvalid ? 'bg-red-50' : 'bg-white'}>
                      <td>{r._rowNumber}</td>
                      <td>{r.startup_name}</td>
                      <td>{r.email}</td>
                      <td>{r.expiry_days ?? ''}</td>
                      <td className="text-sm text-red-600">{errs}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center">
            <button className="btn btn-primary mr-2" onClick={handleUploadAll} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload & Send Invites'}
            </button>
            <div className="ml-4">
              {uploading && <div>Sending Invitations... ({progress.current}/{progress.total})</div>}
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-4 p-3 border rounded">
          <div>✅ Upload Complete</div>
          <div>Total: {result.total}</div>
          <div>Successful: {result.successful?.length ?? 0}</div>
          <div>Failed: {result.failed?.length ?? 0}</div>
          {result.failed?.length > 0 && (
            <div className="mt-2">
              <button className="btn mr-2" onClick={downloadFailedCSV}>Download Failed Rows CSV</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
