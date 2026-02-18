import React from 'react';
import type { EquipmentStatus, TagState } from '@/types';
import { getStatusColor, getTagStateColor } from '@/types';

export function StatusBadge({ status }: { status: EquipmentStatus }) {
  const colors = getStatusColor(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {status}
    </span>
  );
}

export function TagBadge({ state }: { state: TagState }) {
  const colors = getTagStateColor(state);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
      {state === 'OK' && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      {state === 'Due Soon' && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      )}
      {state === 'Expired' && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
        </svg>
      )}
      Tag: {state}
    </span>
  );
}

export function ConditionBadge({ condition }: { condition: string }) {
  const colorMap: Record<string, string> = {
    'New': 'bg-indigo-50 text-indigo-700',
    'Good': 'bg-green-50 text-green-700',
    'Fair': 'bg-yellow-50 text-yellow-700',
    'Poor': 'bg-orange-50 text-orange-700',
    'Damaged': 'bg-red-50 text-red-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorMap[condition] || 'bg-gray-50 text-gray-700'}`}>
      {condition}
    </span>
  );
}
