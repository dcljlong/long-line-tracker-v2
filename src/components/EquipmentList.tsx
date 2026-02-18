import React, { useState } from 'react';
import { useEquipment } from '@/context/EquipmentContext';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge, TagBadge } from '@/components/ui/StatusBadge';
import { computeTagState, computeStatus } from '@/types';
import type { FilterTab, Equipment } from '@/types';

interface EquipmentListProps {
  onSelectEquipment: (id: string) => void;
  onCreateNew: () => void;
  onImport: () => void;
  initialFilter?: string;
}

const FILTER_TABS: FilterTab[] = ['All', 'Available', 'In Use', 'Overdue', 'Expired Tags', 'Due Soon'];

export default function EquipmentList({ onSelectEquipment, onCreateNew, onImport, initialFilter }: EquipmentListProps) {
  const { filteredEquipment, searchQuery, setSearchQuery, activeFilter, setActiveFilter, stats, isLoading } = useEquipment();
  const { isAdmin } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Set initial filter if provided
  React.useEffect(() => {
    if (initialFilter) {
      setActiveFilter(initialFilter as FilterTab);
    }
  }, [initialFilter, setActiveFilter]);

  const filterCounts: Record<FilterTab, number> = {
    'All': stats.total,
    'Available': stats.available,
    'In Use': stats.inUse,
    'Overdue': stats.overdue,
    'Expired Tags': stats.expiredTags,
    'Due Soon': stats.dueSoon,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 space-y-4">
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search equipment, asset ID, category..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                </svg>
              </button>
            </div>

            {isAdmin && (
              <>
                <button
                  onClick={onImport}
                  className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Import
                </button>
                <button
                  onClick={onCreateNew}
                  className="px-4 py-2.5 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#2d5a8e] transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Equipment
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === tab
                  ? 'bg-[#1e3a5f] text-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab}
              <span className={`ml-1.5 text-xs ${activeFilter === tab ? 'text-white/70' : 'text-gray-400'}`}>
                {filterCounts[tab]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-6 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <p className="text-lg font-medium mb-1">No equipment found</p>
            <p className="text-sm">Try adjusting your search or filter criteria</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredEquipment.map(eq => (
              <EquipmentCard key={eq.id} equipment={eq} onClick={() => onSelectEquipment(eq.id)} isAdmin={isAdmin} />
            ))}
          </div>
        ) : (
          <EquipmentTable equipment={filteredEquipment} onSelect={onSelectEquipment} isAdmin={isAdmin} />
        )}

        {/* Results count */}
        {!isLoading && filteredEquipment.length > 0 && (
          <p className="text-xs text-gray-400 mt-4 text-center">
            Showing {filteredEquipment.length} of {stats.total} items
          </p>
        )}
      </div>
    </div>
  );
}

function EquipmentCard({ equipment: eq, onClick, isAdmin }: { equipment: Equipment; onClick: () => void; isAdmin: boolean }) {
  const status = computeStatus(eq);
  const tagState = computeTagState(eq);

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all text-left group w-full"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{eq.asset_id}</span>
            <span className="text-xs text-gray-400">{eq.category}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#1e3a5f] transition-colors">
            {eq.name}
          </h3>
        </div>
        <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400 flex-shrink-0 mt-1 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <StatusBadge status={status} />
        <TagBadge state={tagState} />
      </div>

      {eq.test_tag_next_due && (
        <p className="text-xs text-gray-400 mb-2">
          Next test: {new Date(eq.test_tag_next_due).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      )}

      {status !== 'Available' && eq.assigned_to && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <span className="text-gray-600 font-medium">{eq.assigned_to}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className="text-gray-500">{eq.assigned_site}</span>
          </div>
          {eq.expected_return_date && (
            <div className="flex items-center gap-2 text-xs">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <span className={`${new Date(eq.expected_return_date) < new Date() ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                Due: {new Date(eq.expected_return_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          )}
        </div>
      )}
    </button>
  );
}

function EquipmentTable({ equipment, onSelect, isAdmin }: { equipment: Equipment[]; onSelect: (id: string) => void; isAdmin: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Asset</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tag</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned To</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Site</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Next Test</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {equipment.map(eq => {
              const status = computeStatus(eq);
              const tagState = computeTagState(eq);
              return (
                <tr
                  key={eq.id}
                  onClick={() => onSelect(eq.id)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{eq.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{eq.asset_id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{eq.category}</td>
                  <td className="px-4 py-3"><StatusBadge status={status} /></td>
                  <td className="px-4 py-3"><TagBadge state={tagState} /></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{eq.assigned_to || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{eq.assigned_site || '-'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {eq.test_tag_next_due
                      ? new Date(eq.test_tag_next_due).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
