import React, { useState, useEffect } from 'react';
import { useEquipment } from '@/context/EquipmentContext';
import type { Equipment, EquipmentCondition } from '@/types';
import { CATEGORIES } from '@/types';
import { UI } from '@/lib/ui';

interface EquipmentFormProps {
  equipment?: Equipment | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CONDITIONS: EquipmentCondition[] = ['New', 'Good', 'Fair', 'Poor', 'Damaged'];

export default function EquipmentForm({ equipment, onClose, onSuccess }: EquipmentFormProps) {
  const { createEquipment, updateEquipment } = useEquipment();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEdit = !!equipment;

  // NOTE:
  // The DB schema (per your successful Node insert) includes:
  // - test_tag_done_date
  // - test_tag_next_due_date
  // It does NOT appear to include: notes, tag_threshold_days, or test_tag_next_due
  // We keep notes/threshold in UI for now but DO NOT send them to Supabase.

  const [form, setForm] = useState({
    asset_id: '',
    name: '',
    category: 'General',
    condition: 'Good' as EquipmentCondition,
    notes: '',
    test_tag_done_date: '',
    test_tag_next_due: '',
    tag_threshold_days: 30,
  });

  useEffect(() => {
    if (equipment) {
      setForm({
        asset_id: equipment.asset_id,
        name: equipment.name,
        category: equipment.category,
        condition: equipment.condition,
        notes: (equipment as any).notes || '',
        test_tag_done_date: (equipment as any).test_tag_done_date || '',
        // handle either name if types differ across versions
        test_tag_next_due: (equipment as any).test_tag_next_due_date || (equipment as any).test_tag_next_due || '',
        tag_threshold_days: (equipment as any).tag_threshold_days ?? 30,
      });
    }
  }, [equipment]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.asset_id.trim()) errs.asset_id = 'Asset ID is required';
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.category) errs.category = 'Category is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEdit && equipment) {
        // Explicit payload: only send real DB columns
        const payload: any = {
          asset_id: form.asset_id,
          name: form.name,
          category: form.category,
          condition: form.condition,
          test_tag_done_date: form.test_tag_done_date || null,
          test_tag_next_due_date: form.test_tag_next_due || null,
        };

        const success = await updateEquipment(equipment.id, payload);
        if (success) onSuccess();
        else setSubmitError('Update failed. Check console/network and try again.');
      } else {
        const qrCode = `QR-${form.asset_id}`;

        // Explicit payload: only send real DB columns
        const payload: any = {
          asset_id: form.asset_id,
          name: form.name,
          category: form.category,
          condition: form.condition,
          qr_code: qrCode,
          test_tag_done_date: form.test_tag_done_date || null,
          test_tag_next_due_date: form.test_tag_next_due || null,
          current_status: 'Available',
        };

        const result = await createEquipment(payload);
        if (result) onSuccess();
        else setSubmitError('Create failed. Check console/network and try again.');
      }
    } catch (err: any) {
      console.error('Equipment form error:', err);
      setSubmitError(err?.message || 'Unexpected error creating/updating equipment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${UI.card} w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
        <div className={`px-6 py-4 border-b ${UI.divider} flex items-center justify-between`}>
          <h3 className="text-lg font-bold text-white">
            {isEdit ? 'Edit Equipment' : 'Add New Equipment'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Asset ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.asset_id}
                onChange={e => setForm(f => ({ ...f, asset_id: e.target.value }))}
                placeholder="e.g., TT-0025"
                disabled={isEdit}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-/20 focus:border- ${
                  errors.asset_id ? 'border-red-500/40 bg-red-500/10' : 'border-white/10'
                } ${isEdit ? 'bg-slate-900/40 text-slate-400' : ''}`}
              />
              {errors.asset_id && <p className="text-xs text-red-500 mt-1">{errors.asset_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className={`w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none border ${UI.input}`}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Equipment Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g., Hilti TE 70-ATC Rotary Hammer"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-/20 focus:border- ${
                errors.name ? 'border-red-500/40 bg-red-500/10' : 'border-white/10'
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Condition</label>
            <div className="flex gap-2 flex-wrap">
              {CONDITIONS.map(cond => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, condition: cond }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    form.condition === cond
                      ? 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/20 border-transparent'
                      : 'border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Notes (local only for now)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              placeholder="Equipment description or notes..."
              className="w-full px-3 py-2.5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-/20 focus:border- resize-none"
            />
          </div>

          <div className={`border-t ${UI.divider} pt-4`}>
            <h4 className="text-sm font-semibold text-white mb-3">Test & Tag Compliance</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Last Test Date</label>
                <input
                  type="date"
                  value={form.test_tag_done_date}
                  onChange={e => setForm(f => ({ ...f, test_tag_done_date: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none border ${UI.input}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Next Due Date</label>
                <input
                  type="date"
                  value={form.test_tag_next_due}
                  onChange={e => setForm(f => ({ ...f, test_tag_next_due: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none border ${UI.input}`}
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Due Soon Threshold (days) (local only for now)
              </label>
              <input
                type="number"
                value={form.tag_threshold_days}
                onChange={e => setForm(f => ({ ...f, tag_threshold_days: parseInt(e.target.value) || 30 }))}
                min={1}
                max={365}
                className="w-32 px-3 py-2.5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-/20 focus:border-"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-white/10 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900/40 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-amber-500/90 text-slate-950 rounded-lg text-sm font-semibold hover:bg-amber-500 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                isEdit ? 'Update Equipment' : 'Create Equipment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


