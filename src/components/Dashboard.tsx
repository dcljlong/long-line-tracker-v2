import React from 'react';
import { useEquipment } from '@/context/EquipmentContext';
import { computeTagState, computeStatus } from '@/types';
import { UI } from '@/lib/ui';

interface DashboardProps {
  onNavigate: (view: string, filter?: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { stats, equipment, movements, isLoading } = useEquipment();

  if (isLoading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  const kpiCards = [
    { label: 'Total Equipment', value: stats.total, filter: 'All', kind: 'info' },
    { label: 'Available', value: stats.available, filter: 'Available', kind: 'info' },
    { label: 'In Use', value: stats.inUse, filter: 'In Use', kind: 'info' },
    { label: 'Overdue', value: stats.overdue, filter: 'Overdue', kind: 'danger' },
    { label: 'Expired Tags', value: stats.expiredTags, filter: 'Expired Tags', kind: 'danger' },
    { label: 'Due Soon', value: stats.dueSoon, filter: 'Due Soon', kind: 'warning' },
  ];

  return (
    <div className="space-y-6">

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        {kpiCards.map((card, idx) => (
          <button
            key={card.label}
            onClick={() => onNavigate('equipment', card.filter)}
            className={`${UI.card} ${UI.cardHover} llt-pad-md text-left transition-all ${idx === 0 ? "llt-kpi-primary 2xl:col-span-2" : ""} ${Number(card.value) > 0 && card.kind === "danger" ? "llt-kpi-state-danger" : ""} ${Number(card.value) > 0 && card.kind === "warning" ? "llt-kpi-state-warning" : ""} ${Number(card.value) > 0 && card.kind === "info" ? "llt-kpi-state-info" : ""}`}
          >
            <p className="llt-kpi">{card.value}</p>
            <p className="llt-eyebrow text-muted-foreground mt-1">
              {card.label}
            </p>
          </button>
        ))}
      </div>

      {/* SECOND ROW */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* RECENT ACTIVITY */}
        <div className={`xl:col-span-2 ${UI.card}`}>
          <div className={`px-5 py-4 border-b ${UI.divider} flex items-center justify-between`}>
            <h3 className="font-semibold text-white">Recent Activity</h3>
          </div>

          <div className="divide-y divide-slate-700/40">
            {movements.length === 0 ? (
              <div className="llt-pad-md llt-body-sm text-muted-foreground/70 text-center">
                No recent activity
              </div>
            ) : (
              movements.slice(0, 8).map(m => (
                <div key={m.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="llt-body-sm text-foreground/90">
                      {m.event_type === 'check_out' ? 'Checked Out' : 'Returned'}
                    </p>
                    <p className="llt-caption text-muted-foreground/70">
                      {new Date(m.event_timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="llt-caption text-muted-foreground">
                    {m.assigned_to}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COMPLIANCE SUMMARY */}
        <div className={`${UI.card}`}>
          <div className={`px-5 py-4 border-b ${UI.divider}`}>
            <h3 className="font-semibold text-white">Compliance Summary</h3>
          </div>

          <div className="llt-pad-md llt-stack-md llt-body-sm text-foreground/85">
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



