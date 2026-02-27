import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { Equipment, Movement, FilterTab, DashboardStats } from '@/types';
import { computeTagState, computeStatus } from '@/types';

interface EquipmentContextType {
  equipment: Equipment[];
  movements: Movement[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  activeFilter: FilterTab;
  filteredEquipment: Equipment[];
  stats: DashboardStats;
  selectedEquipment: Equipment | null;
  selectedMovements: Movement[];
  setSearchQuery: (q: string) => void;
  setActiveFilter: (f: FilterTab) => void;
  selectEquipment: (id: string | null) => void;
  refreshData: () => Promise<void>;
  createEquipment: (data: Partial<Equipment>) => Promise<Equipment | null>;
  updateEquipment: (id: string, data: Partial<Equipment>) => Promise<boolean>;
  createMovement: (data: Partial<Movement>) => Promise<boolean>;
  uploadPhoto: (file: File, path: string) => Promise<string | null>;
}

const EquipmentContext = createContext<EquipmentContextType | null>(null);

function fuzzyMatch(text: string, query: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  if (lowerText.includes(lowerQuery)) return true;
  // Simple fuzzy: check if all chars appear in order
  let qi = 0;
  for (let i = 0; i < lowerText.length && qi < lowerQuery.length; i++) {
    if (lowerText[i] === lowerQuery[qi]) qi++;
  }
  return qi === lowerQuery.length;
}

type EnrichedEquipment = Equipment & {
  _derived_status: ReturnType<typeof computeStatus>;
  _derived_tag: ReturnType<typeof computeTagState>;
};

export function EquipmentProvider({ children }: { children: React.ReactNode }) {
  const [equipment, setEquipment] = useState<EnrichedEquipment[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const [eqRes, mvRes] = await Promise.all([
        supabase.from('equipment').select('*').order('asset_id', { ascending: true }).abortSignal(controller.signal),
        supabase.from('movements').select('*').order('event_timestamp', { ascending: false }).abortSignal(controller.signal),
      ]);

      clearTimeout(timeout);

      if (eqRes.error) throw eqRes.error;
      if (mvRes.error) throw mvRes.error;

      const enriched: EnrichedEquipment[] = (eqRes.data || []).map((eq: Equipment) => {
        const derivedStatus = computeStatus(eq);
        const derivedTag = computeTagState(eq);
        return {
          ...eq,
          // keep existing current_status field consistent with derived status (canonical)
          current_status: derivedStatus as any,
          _derived_status: derivedStatus,
          _derived_tag: derivedTag,
        };
      });

      setEquipment(enriched);
      setMovements(mvRes.data || []);
    } catch (e: any) {
      if (e.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(e.message || 'Failed to load data');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo<DashboardStats>(() => {
    const s: DashboardStats = { total: 0, available: 0, inUse: 0, overdue: 0, repair: 0, expiredTags: 0, dueSoon: 0 };
    equipment.forEach(eq => {
      s.total++;
      const status = eq._derived_status;
      if (status === 'Available') s.available++;
      if (status === 'In Use') s.inUse++;
      if (status === 'Overdue') s.overdue++;
      if (status === 'Repair') s.repair++;
      const tag = eq._derived_tag;
      if (tag === 'Expired') s.expiredTags++;
      if (tag === 'Due Soon') s.dueSoon++;
    });
    return s;
  }, [equipment]);

  const filteredEquipment = useMemo(() => {
    let result: EnrichedEquipment[] = equipment;

    // Apply filter tab (reuse derived values; no recompute)
    switch (activeFilter) {
      case 'Available':
        result = result.filter(eq => eq._derived_status === 'Available');
        break;
      case 'In Use':
        result = result.filter(eq => eq._derived_status === 'In Use');
        break;
      case 'Overdue':
        result = result.filter(eq => eq._derived_status === 'Overdue');
        break;
      case 'Repair':
case 'Maintenance':
  result = result.filter(eq => eq._derived_status === 'Repair');
  break;
      case 'Expired Tags':
        result = result.filter(eq => eq._derived_tag === 'Expired');
        break;
      case 'Due Soon':
        result = result.filter(eq => eq._derived_tag === 'Due Soon');
        break;
    }

    // Apply search
    if (searchQuery.trim()) {
      result = result.filter(eq =>
        fuzzyMatch(eq.name, searchQuery) ||
        fuzzyMatch(eq.asset_id, searchQuery) ||
        fuzzyMatch(eq.category, searchQuery) ||
        fuzzyMatch(eq.assigned_to || '', searchQuery) ||
        fuzzyMatch(eq.assigned_site || '', searchQuery)
      );
    }

    return result;
  }, [equipment, activeFilter, searchQuery]);

  const selectedEquipment = useMemo(() => {
    if (!selectedId) return null;
    return equipment.find(eq => eq.id === selectedId) || null;
  }, [selectedId, equipment]);

  const selectedMovements = useMemo(() => {
    if (!selectedId) return [];
    return movements.filter(m => m.equipment_id === selectedId);
  }, [selectedId, movements]);

  const selectEquipment = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const createEquipment = useCallback(async (data: Partial<Equipment>): Promise<Equipment | null> => {
    try {
      const { data: result, error } = await supabase
        .from('equipment')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      await fetchData();
      return result;
    } catch (e: any) {
      console.error('[createEquipment] failed', e);
      setError(e?.message || 'Create failed');
      return null;
    }
  }, [fetchData]);

  const updateEquipment = useCallback(async (id: string, data: Partial<Equipment>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('equipment')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      await fetchData();
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    }
  }, [fetchData]);

  const createMovement = useCallback(async (data: Partial<Movement>): Promise<boolean> => {
    try {
      const { error: mvError } = await supabase.from('movements').insert(data);
      if (mvError) throw mvError;

      // Update equipment status based on movement type
      const eqUpdate: Partial<Equipment> = {};
      if (data.event_type === 'check_out') {
        eqUpdate.current_status = 'In Use';
        eqUpdate.assigned_to = data.assigned_to || '';
        eqUpdate.assigned_site = data.site || '';
        eqUpdate.assigned_job = data.job_reference || '';
        eqUpdate.expected_return_date = data.expected_return_date || null;
      } else if (data.event_type === 'return') {
        // On return: clear assignment, and optionally flag for maintenance/repair
        const requiresService = Boolean((data as any).requires_service);
        const requiresRepair = Boolean((data as any).requires_repair);

        eqUpdate.current_status = (requiresService || requiresRepair) ? 'Maintenance' : 'Available';
        eqUpdate.assigned_to = '';
        eqUpdate.assigned_site = '';
        eqUpdate.assigned_job = '';
        eqUpdate.expected_return_date = null;
      }

      if (data.equipment_id) {
        const { error: eqError } = await supabase
          .from('equipment')
          .update({ ...eqUpdate, updated_at: new Date().toISOString() })
          .eq('id', data.equipment_id);
        if (eqError) throw eqError;
      }

      await fetchData();
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    }
  }, [fetchData]);

  const uploadPhoto = useCallback(async (file: File, path: string): Promise<string | null> => {
    try {
      const { error } = await supabase.storage
        .from('equipment-photos')
        .upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('equipment-photos').getPublicUrl(path);
      return data.publicUrl;
    } catch (e: any) {
      console.error('[createEquipment] failed', e);
      setError(e?.message || 'Create failed');
      return null;
    }
  }, []);

  return (
    <EquipmentContext.Provider value={{
      equipment, movements, isLoading, error,
      searchQuery, activeFilter, filteredEquipment, stats,
      selectedEquipment, selectedMovements,
      setSearchQuery, setActiveFilter, selectEquipment,
      refreshData: fetchData, createEquipment, updateEquipment,
      createMovement, uploadPhoto,
    }}>
      {children}
    </EquipmentContext.Provider>
  );
}

export function useEquipment() {
  const ctx = useContext(EquipmentContext);
  if (!ctx) throw new Error('useEquipment must be used within EquipmentProvider');
  return ctx;
}




