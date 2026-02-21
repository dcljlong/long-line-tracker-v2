import React from 'react';
import { useEquipment } from '@/context/EquipmentContext';
import { computeTagState, computeStatus } from '@/types';

interface DashboardProps {
  onNavigate: (view: string, filter?: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { stats, equipment, movements, isLoading } = useEquipment();

  if (isLoading) {
    return <div className="text-slate-400">Loading...</div>;
  }

  const kpiCards = [
    { label: 'Total Equipment', value: stats.total, filter: 'All' },
    { label: 'Available', value: stats.available, filter: 'Available' },
    { label: 'In Use', value: stats.inUse, filter: 'In Use' },
    { label: 'Overdue', value: stats.overdue, filter: 'Overdue' },
    { label: 'Expired Tags', value: stats.expiredTags, filter: 'Expired Tags' },
    { label: 'Due Soon', value: stats.dueSoon, filter: 'Due Soon' },
  ];

  return (
    <div className="space-y-6">

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        {kpiCards.map(card => (
          <button
            key={card.label}
            onClick={() => onNavigate('equipment', card.filter)}
            className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 text-left hover:border-slate-600 hover:bg-slate-800 transition-all"
          >
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide">
              {card.label}
            </p>
          </button>
        ))}
      </div>

      {/* SECOND ROW */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* RECENT ACTIVITY */}
        <div className="xl:col-span-2 bg-slate-800/60 border border-slate-700/50 rounded-xl">
          <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <h3 className="font-semibold text-white">Recent Activity</h3>
          </div>

          <div className="divide-y divide-slate-700/40">
            {movements.length === 0 ? (
              <div className="p-6 text-sm text-slate-500 text-center">
                No recent activity
              </div>
            ) : (
              movements.slice(0, 8).map(m => (
                <div key={m.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-200">
                      {m.event_type === 'check_out' ? 'Checked Out' : 'Returned'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(m.event_timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {m.assigned_to}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COMPLIANCE SUMMARY */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl">
          <div className="px-5 py-4 border-b border-slate-700/50">
            <h3 className="font-semibold text-white">Compliance Summary</h3>
          </div>

          <div className="p-5 space-y-4 text-sm text-slate-300">
            <div className="flex justify-between">
              <span>Compliant</span>
              <span>{equipment.filter(eq => computeTagState(eq) === 'OK').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Due Soon</span>
              <span>{stats.dueSoon}</span>
            </div>
            <div className="flex justify-between">
              <span>Expired</span>
              <span className="text-red-400">{stats.expiredTags}</span>
            </div>
            <div className="flex justify-between">
              <span>No Tag</span>
              <span>{equipment.filter(eq => computeTagState(eq) === 'No Tag').length}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
