import React from 'react';
import { useEquipment } from '@/context/EquipmentContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  collapsed: boolean; // true = compact (w-16), false = expanded (w-64)
  onToggle: () => void;
}

export default function Sidebar({ currentView, onNavigate, collapsed, onToggle }: SidebarProps) {
  const { stats } = useEquipment();

  const logoSrc = `${import.meta.env.BASE_URL}LLT-developer-logo.png`;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      ),
    },
    {
      id: 'equipment',
      label: 'Equipment',
      badge: stats.total,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384-3.19A2.625 2.625 0 015.25 9.75V6.375a2.625 2.625 0 012.786-2.619l5.384.319M11.42 15.17l5.384 3.19A2.625 2.625 0 0017.25 16.5V6.375a2.625 2.625 0 00-2.786-2.619l-5.384.319M11.42 15.17V20.25" />
        </svg>
      ),
    },
  ];

  const alertItems = [
    { label: 'Overdue', count: stats.overdue, color: 'bg-red-500' },
    { label: 'Expired Tags', count: stats.expiredTags, color: 'bg-red-400' },
    { label: 'Due Soon', count: stats.dueSoon, color: 'bg-amber-500' },
  ];

  const isActive = (id: string) => currentView === id || (id === 'equipment' && currentView === 'detail');

  return (
    <aside
      className={`${collapsed ? 'w-16' : 'w-64'} h-screen flex flex-col transition-[width] duration-300
        bg-slate-900/35 backdrop-blur-xl ring-1 ring-white/10`}
    >
      {/* Brand */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-white/10">
        <img src={logoSrc} alt="Long Line Tracker" className="w-10 h-10 object-contain" draggable={false} />
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-white font-semibold leading-tight">Long Line</div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Tracker v2</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            title={collapsed ? item.label : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive(item.id)
                ? 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/15'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="shrink-0">{item.icon}</span>

            {!collapsed && (
              <>
                <span className="flex-1 text-left truncate">{item.label}</span>
                {typeof item.badge === 'number' && (
                  <span className="bg-white/10 text-slate-200 text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </nav>

      {/* Alerts (expanded only) */}
      {!collapsed && (
        <div className="px-3 pb-4">
          <div className="bg-white/5 rounded-xl p-3 ring-1 ring-white/10">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Alerts</p>
            <div className="space-y-2">
              {alertItems.map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">{item.label}</span>
                  <span className={`${item.color} text-white text-xs font-bold px-1.5 py-0.5 rounded`}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Collapse */}
      <button
        onClick={onToggle}
        className="h-12 flex items-center justify-center border-t border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        <svg className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
        </svg>
      </button>
    </aside>
  );
}
