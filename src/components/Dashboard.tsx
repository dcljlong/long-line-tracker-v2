import React from 'react';
import { useEquipment } from '@/context/EquipmentContext';
import { computeTagState, computeStatus } from '@/types';

interface DashboardProps {
  onNavigate: (view: string, filter?: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { stats, equipment, movements, isLoading } = useEquipment();

  const kpiCards = [
    {
      label: 'Total Equipment',
      value: stats.total,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
      color: 'from-[#1e3a5f] to-[#2d5a8e]',
      iconBg: 'bg-blue-100 text-blue-600',
      onClick: () => onNavigate('equipment', 'All'),
    },
    {
      label: 'Available',
      value: stats.available,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-100 text-emerald-600',
      onClick: () => onNavigate('equipment', 'Available'),
    },
    {
      label: 'In Use',
      value: stats.inUse,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100 text-blue-600',
      onClick: () => onNavigate('equipment', 'In Use'),
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
        </svg>
      ),
      color: 'from-red-500 to-red-600',
      iconBg: 'bg-red-100 text-red-600',
      onClick: () => onNavigate('equipment', 'Overdue'),
    },
    {
      label: 'Expired Tags',
      value: stats.expiredTags,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-red-400 to-red-500',
      iconBg: 'bg-red-100 text-red-500',
      onClick: () => onNavigate('equipment', 'Expired Tags'),
    },
    {
      label: 'Due Soon',
      value: stats.dueSoon,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-100 text-amber-600',
      onClick: () => onNavigate('equipment', 'Due Soon'),
    },
  ];

  // Get recent movements
  const recentMovements = movements.slice(0, 8).map(m => {
    const eq = equipment.find(e => e.id === m.equipment_id);
    return { ...m, equipmentName: eq?.name || 'Unknown', assetId: eq?.asset_id || '' };
  });

  // Get critical alerts
  const expiredItems = equipment.filter(eq => computeTagState(eq) === 'Expired');
  const overdueItems = equipment.filter(eq => computeStatus(eq) === 'Overdue');

  // Site utilization
  const siteMap = new Map<string, number>();
  equipment.forEach(eq => {
    if (eq.assigned_site) {
      siteMap.set(eq.assigned_site, (siteMap.get(eq.assigned_site) || 0) + 1);
    }
  });
  const siteUtilization = Array.from(siteMap.entries()).sort((a, b) => b[1] - a[1]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Alert Banner */}
      {(expiredItems.length > 0 || overdueItems.length > 0) && (
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm">Action Required</p>
              <p className="text-sm text-white/80">
                {expiredItems.length > 0 && `${expiredItems.length} expired tag${expiredItems.length > 1 ? 's' : ''}`}
                {expiredItems.length > 0 && overdueItems.length > 0 && ' and '}
                {overdueItems.length > 0 && `${overdueItems.length} overdue item${overdueItems.length > 1 ? 's' : ''}`}
                {' require immediate attention'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('equipment', 'Overdue')}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
          >
            View All
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map(card => (
          <button
            key={card.label}
            onClick={card.onClick}
            className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                {card.icon}
              </span>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{card.label}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            <button
              onClick={() => onNavigate('equipment')}
              className="text-xs text-[#1e3a5f] hover:text-[#2d5a8e] font-medium"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentMovements.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No recent activity</div>
            ) : (
              recentMovements.map(m => (
                <div key={m.id} className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    m.event_type === 'check_out' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {m.event_type === 'check_out' ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {m.equipmentName}
                      <span className="text-gray-400 font-normal ml-1">({m.assetId})</span>
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {m.event_type === 'check_out' ? 'Checked out to' : 'Returned by'}{' '}
                      <span className="font-medium">{m.assigned_to}</span>
                      {m.site && <> at {m.site}</>}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(m.event_timestamp).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Compliance Summary */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Compliance Summary</h3>
            </div>
            <div className="p-5 space-y-4">
              {(() => {
                const ok = equipment.filter(eq => computeTagState(eq) === 'OK').length;
                const dueSoon = stats.dueSoon;
                const expired = stats.expiredTags;
                const noTag = equipment.filter(eq => computeTagState(eq) === 'No Tag').length;
                const total = stats.total || 1;
                return (
                  <>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Compliant</span>
                        <span className="font-semibold text-emerald-600">{ok}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(ok / total) * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Due Soon</span>
                        <span className="font-semibold text-amber-600">{dueSoon}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${(dueSoon / total) * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Expired</span>
                        <span className="font-semibold text-red-600">{expired}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${(expired / total) * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">No Tag</span>
                        <span className="font-semibold text-gray-500">{noTag}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-400 rounded-full transition-all" style={{ width: `${(noTag / total) * 100}%` }} />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Site Utilization */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Equipment by Site</h3>
            </div>
            <div className="p-5 space-y-3">
              {siteUtilization.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No active assignments</p>
              ) : (
                siteUtilization.map(([site, count]) => (
                  <div key={site} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{site}</p>
                    </div>
                    <span className="text-sm font-bold text-[#1e3a5f]">{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
