export type UserRole = 'admin' | 'standard';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export type EquipmentCondition = 'New' | 'Good' | 'Fair' | 'Poor' | 'Damaged';
export type EquipmentStatus = 'Available' | 'In Use' | 'Overdue' | 'Maintenance';
export type TagState = 'OK' | 'Due Soon' | 'Expired' | 'No Tag';
export type MovementEventType = 'check_out' | 'return';

export interface Equipment {
  id: string;
  asset_id: string;
  qr_code: string;
  name: string;
  category: string;
  condition: EquipmentCondition;
  notes: string;
  photo_url: string;
  test_tag_done_date: string | null;
  test_tag_next_due: string | null;
  tag_threshold_days: number;
  current_status: EquipmentStatus;
  assigned_to: string;
  assigned_site: string;
  assigned_job: string;
  expected_return_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Movement {
  id: string;
  equipment_id: string;
  event_type: MovementEventType;
  event_timestamp: string;
  assigned_to: string;
  site: string;
  job_reference: string;
  notes: string;
  pickup_photo_url: string;
  return_photo_url: string;
  expected_return_date: string | null;
  created_by: string;
  created_at: string;
}

export type FilterTab = 'All' | 'Available' | 'In Use' | 'Overdue' | 'Expired Tags' | 'Due Soon';

export interface DashboardStats {
  total: number;
  available: number;
  inUse: number;
  overdue: number;
  expiredTags: number;
  dueSoon: number;
}

export function computeTagState(equipment: Equipment): TagState {
  if (!equipment.test_tag_next_due) return 'No Tag';
  const now = new Date();
  const dueDate = new Date(equipment.test_tag_next_due);
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Expired';
  if (diffDays <= equipment.tag_threshold_days) return 'Due Soon';
  return 'OK';
}

export function computeStatus(equipment: Equipment): EquipmentStatus {
  if (equipment.current_status === 'Maintenance') return 'Maintenance';
  if (equipment.current_status === 'In Use') {
    if (equipment.expected_return_date) {
      const now = new Date();
      const returnDate = new Date(equipment.expected_return_date);
      if (returnDate < now) return 'Overdue';
    }
    return 'In Use';
  }
  return 'Available';
}

export function getTagStateColor(state: TagState): { bg: string; text: string; border: string } {
  // Token-driven surfaces; status hues only for emphasis.
  // Avoid light-only palette classes (bg-*-50 etc).
  switch (state) {
    case 'OK':
      return { bg: 'bg-card/60', text: 'text-emerald-400', border: 'border-emerald-500/25' };
    case 'Due Soon':
      return { bg: 'bg-card/60', text: 'text-amber-400', border: 'border-amber-500/25' };
    case 'Expired':
      return { bg: 'bg-card/60', text: 'text-destructive', border: 'border-destructive/35' };
    case 'No Tag':
      return { bg: 'bg-card/60', text: 'text-muted-foreground', border: 'border-border/60' };
  }
}

export function getStatusColor(status: EquipmentStatus): { bg: string; text: string; dot: string } {
  // Token-driven surfaces; hue only for dot + label emphasis.
  switch (status) {
    case 'Available':
      return { bg: 'bg-card/60', text: 'text-emerald-400', dot: 'bg-emerald-500' };
    case 'In Use':
      return { bg: 'bg-card/60', text: 'text-sky-400', dot: 'bg-sky-500' };
    case 'Overdue':
      return { bg: 'bg-card/60', text: 'text-destructive', dot: 'bg-destructive' };
    case 'Maintenance':
      return { bg: 'bg-card/60', text: 'text-orange-400', dot: 'bg-orange-500' };
  }
}

export const CATEGORIES = [
  'Power Tools',
  'Survey Equipment',
  'Compaction',
  'Power Supply',
  'Cutting Equipment',
  'Fastening Tools',
  'Demolition',
  'Electrical Testing',
  'Access Equipment',
  'General',
  'Safety Equipment',
  'Hand Tools',
];

