import React, { useState, useEffect } from 'react';
import { useEquipment } from '@/context/EquipmentContext';
import type { Equipment, EquipmentCondition } from '@/types';
import { CATEGORIES } from '@/types';

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
  const isEdit = !!equipment;

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
        notes: equipment.notes || '',
        test_tag_done_date: equipment.test_tag_done_date || '',
        test_tag_next_due: equipment.test_tag_next_due || '',
        tag_threshold_days: equipment.tag_threshold_days,
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
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEdit && equipment) {
        const success = await updateEquipment(equipment.id, {
          ...form,
          test_tag_done_date: form.test_tag_done_date || null,
          test_tag_next_due: form.test_tag_next_due || null,
        });
        if (success) onSuccess();
      } else {
        const qrCode = `QR-${form.asset_id}`;
        const result = await createEquipment({
          ...form,
          qr_code: qrCode,
          test_tag_done_date: form.test_tag_done_date || null,
          test_tag_next_due: form.test_tag_next_due || null,
          current_status: 'Available',
        });
        if (result) onSuccess();
      }
    } catch (err) {
      console.error('Equipment form error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            {isEdit ? 'Edit Equipment' : 'Add New Equipment'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.asset_id}
                onChange={e => setForm(f => ({ ...f, asset_id: e.target.value }))}
                placeholder="e.g., TT-0025"
                disabled={isEdit}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] ${
                  errors.asset_id ? 'border-red-300 bg-red-50' : 'border-gray-200'
                } ${isEdit ? 'bg-gray-50 text-gray-500' : ''}`}
              />
              {errors.asset_id && <p className="text-xs text-red-500 mt-1">{errors.asset_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Equipment Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g., Hilti TE 70-ATC Rotary Hammer"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
            <div className="flex gap-2">
              {CONDITIONS.map(cond => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, condition: cond }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    form.condition === cond
                      ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              placeholder="Equipment description or notes..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] resize-none"
            />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Test & Tag Compliance</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Test Date</label>
                <input
                  type="date"
                  value={form.test_tag_done_date}
                  onChange={e => setForm(f => ({ ...f, test_tag_done_date: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Due Date</label>
                <input
                  type="date"
                  value={form.test_tag_next_due}
                  onChange={e => setForm(f => ({ ...f, test_tag_next_due: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Soon Threshold (days)
              </label>
              <input
                type="number"
                value={form.tag_threshold_days}
                onChange={e => setForm(f => ({ ...f, tag_threshold_days: parseInt(e.target.value) || 30 }))}
                min={1}
                max={365}
                className="w-32 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#2d5a8e] transition-colors disabled:opacity-50"
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
