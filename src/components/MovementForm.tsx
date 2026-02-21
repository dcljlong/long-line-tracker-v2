import React, { useState, useRef } from 'react';
import { useEquipment } from '@/context/EquipmentContext';
import { useAuth } from '@/context/AuthContext';
import type { MovementEventType } from '@/types';
import { UI } from '@/lib/ui';

interface MovementFormProps {
  equipmentId: string;
  equipmentName: string;
  eventType: MovementEventType;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MovementForm({ equipmentId, equipmentName, eventType, onClose, onSuccess }: MovementFormProps) {
  const { createMovement, uploadPhoto } = useEquipment();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    assigned_to: '',
    site: '',
    job_reference: '',
    notes: '',
    expected_return_date: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (eventType === 'check_out') {
      if (!form.assigned_to.trim()) errs.assigned_to = 'Assigned to is required for check-out';
      if (!form.site.trim()) errs.site = 'Site is required for check-out';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      let photoUrl = '';
      if (photoFile) {
        const path = `movements/${equipmentId}/${Date.now()}-${photoFile.name}`;
        const url = await uploadPhoto(photoFile, path);
        if (url) photoUrl = url;
      }

      const movementData: any = {
        equipment_id: equipmentId,
        event_type: eventType,
        event_timestamp: new Date().toISOString(),
        assigned_to: form.assigned_to,
        site: form.site,
        job_reference: form.job_reference,
        notes: form.notes,
        created_by: user?.email || 'system',
      };

      if (eventType === 'check_out') {
        movementData.expected_return_date = form.expected_return_date || null;
        if (photoUrl) movementData.pickup_photo_url = photoUrl;
      } else {
        if (photoUrl) movementData.return_photo_url = photoUrl;
      }

      const success = await createMovement(movementData);
      if (success) {
        onSuccess();
      }
    } catch (err) {
      console.error('Movement error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCheckOut = eventType === 'check_out';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${UI.card} w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${UI.divider} flex items-center justify-between ${
          isCheckOut ? 'bg-blue-50' : 'bg-emerald-50'
        }`}>
          <div>
            <h3 className={`text-lg font-bold ${isCheckOut ? 'text-blue-900' : 'text-emerald-900'}`}>
              {isCheckOut ? 'Check Out Equipment' : 'Return Equipment'}
            </h3>
            <p className="text-sm text-slate-300 mt-0.5">{equipmentName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isCheckOut && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Assigned To <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.assigned_to}
                  onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}
                  placeholder="Person name"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2  ${
                    errors.assigned_to ? 'border-red-500/40 bg-red-500/10' : 'border-white/10'
                  }`}
                />
                {errors.assigned_to && <p className="text-xs text-red-500 mt-1">{errors.assigned_to}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Site <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.site}
                  onChange={e => setForm(f => ({ ...f, site: e.target.value }))}
                  placeholder="Site name or location"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2  ${
                    errors.site ? 'border-red-500/40 bg-red-500/10' : 'border-white/10'
                  }`}
                />
                {errors.site && <p className="text-xs text-red-500 mt-1">{errors.site}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Job Reference</label>
                <input
                  type="text"
                  value={form.job_reference}
                  onChange={e => setForm(f => ({ ...f, job_reference: e.target.value }))}
                  placeholder="e.g., JOB-2024-001"
                  className="w-full px-3 py-2.5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 "
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Expected Return Date</label>
                <input
                  type="date"
                  value={form.expected_return_date}
                  onChange={e => setForm(f => ({ ...f, expected_return_date: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 "
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="Add any relevant notes..."
              className="w-full px-3 py-2.5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2  resize-none"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              {isCheckOut ? 'Pickup Photo' : 'Return Photo'}
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/10 rounded-lg p-4 text-center cursor-pointer hover:border-white/20 transition-colors"
            >
              {photoFile ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-slate-200">{photoFile.name}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPhotoFile(null); }}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <svg className="w-8 h-8 text-white/20 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                  <p className="text-xs text-slate-400">Click to upload photo</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={e => setPhotoFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-white/10 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ${
                isCheckOut
                  ? 'bg-amber-500/90 hover:bg-amber-500 text-slate-950 font-semibold'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                isCheckOut ? 'Confirm Check Out' : 'Confirm Return'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

