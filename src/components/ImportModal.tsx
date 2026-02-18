import React, { useState, useRef } from 'react';
import { useEquipment } from '@/context/EquipmentContext';

interface ImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportRow {
  asset_id: string;
  name: string;
  category: string;
  condition: string;
  notes: string;
  test_tag_done_date: string;
  test_tag_next_due: string;
  qr_code?: string;
  isValid: boolean;
  errors: string[];
  isDuplicate: boolean;
}

export default function ImportModal({ onClose, onSuccess }: ImportModalProps) {
  const { createEquipment, equipment } = useEquipment();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'done'>('upload');
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState({ success: 0, failed: 0 });

  const existingAssetIds = new Set(equipment.map(e => e.asset_id.toLowerCase()));

  const parseCSV = (text: string): ImportRow[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = values[i] || ''; });

      const errors: string[] = [];
      const assetId = row['asset_id'] || row['asset id'] || row['id'] || '';
      const name = row['name'] || row['equipment name'] || row['equipment'] || '';
      
      if (!assetId) errors.push('Missing Asset ID');
      if (!name) errors.push('Missing Name');

      const isDuplicate = existingAssetIds.has(assetId.toLowerCase());
      if (isDuplicate) errors.push('Duplicate Asset ID');

      return {
        asset_id: assetId,
        name,
        category: row['category'] || row['type'] || 'General',
        condition: row['condition'] || 'Good',
        notes: row['notes'] || row['description'] || '',
        test_tag_done_date: row['test_tag_done_date'] || row['last_test'] || row['last test'] || '',
        test_tag_next_due: row['test_tag_next_due'] || row['next_test'] || row['next test'] || '',
        qr_code: row['qr_code'] || row['qr'] || '',
        isValid: errors.length === 0,
        errors,
        isDuplicate,
      };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      setRows(parsed);
      setStep('preview');
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const validRows = rows.filter(r => r.isValid);
    if (validRows.length === 0) return;

    setStep('importing');
    let success = 0;
    let failed = 0;

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      try {
        const result = await createEquipment({
          asset_id: row.asset_id,
          qr_code: row.qr_code || `QR-${row.asset_id}`,
          name: row.name,
          category: row.category,
          condition: row.condition as any,
          notes: row.notes,
          test_tag_done_date: row.test_tag_done_date || null,
          test_tag_next_due: row.test_tag_next_due || null,
          current_status: 'Available',
          tag_threshold_days: 30,
        });
        if (result) success++;
        else failed++;
      } catch {
        failed++;
      }
      setImportProgress(((i + 1) / validRows.length) * 100);
    }

    setImportResults({ success, failed });
    setStep('done');
  };

  const validCount = rows.filter(r => r.isValid).length;
  const invalidCount = rows.filter(r => !r.isValid).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Import Equipment</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 'upload' && (
            <div className="space-y-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-[#1e3a5f] hover:bg-blue-50/30 transition-all"
              >
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-sm font-medium text-gray-700 mb-1">Click to upload CSV file</p>
                <p className="text-xs text-gray-400">Supports .csv files</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Expected CSV Format</h4>
                <code className="text-xs text-gray-600 block bg-white p-3 rounded border border-gray-200 font-mono">
                  asset_id,name,category,condition,notes,test_tag_done_date,test_tag_next_due<br />
                  TT-0025,Makita Drill,Power Tools,Good,Heavy duty,2026-01-15,2026-07-15
                </code>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {validCount} valid
                </div>
                {invalidCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    {invalidCount} invalid
                  </div>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-64">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Status</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Asset ID</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Name</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Category</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Issues</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rows.map((row, i) => (
                        <tr key={i} className={row.isValid ? '' : 'bg-red-50/50'}>
                          <td className="px-3 py-2">
                            {row.isValid ? (
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              </span>
                            ) : (
                              <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs">{row.asset_id || '-'}</td>
                          <td className="px-3 py-2">{row.name || '-'}</td>
                          <td className="px-3 py-2 text-gray-500">{row.category}</td>
                          <td className="px-3 py-2 text-xs text-red-500">{row.errors.join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="text-center py-12">
              <svg className="animate-spin w-12 h-12 text-[#1e3a5f] mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm font-medium text-gray-900 mb-2">Importing equipment...</p>
              <div className="w-64 mx-auto h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1e3a5f] rounded-full transition-all"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">{Math.round(importProgress)}%</p>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg font-bold text-gray-900 mb-1">Import Complete</p>
              <p className="text-sm text-gray-500">
                {importResults.success} imported successfully
                {importResults.failed > 0 && `, ${importResults.failed} failed`}
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          {step === 'upload' && (
            <button onClick={onClose} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
          )}
          {step === 'preview' && (
            <>
              <button onClick={() => { setStep('upload'); setRows([]); }} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={validCount === 0}
                className="px-4 py-2.5 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#2d5a8e] disabled:opacity-50"
              >
                Import {validCount} Items
              </button>
            </>
          )}
          {step === 'done' && (
            <button
              onClick={() => { onSuccess(); onClose(); }}
              className="px-4 py-2.5 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#2d5a8e]"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
