import type { CanonicalEquipmentStatus } from '@/types';

export const StatusConfig: Record<CanonicalEquipmentStatus, {
  label: string;
  barClass: string;
  badgeClass: string;
  textClass: string;
}> = {
  "Available": {
    label: "AVAILABLE",
    barClass: "llt-card-statusbar--ok",
    badgeClass: "llt-badge-ok",
    textClass: "llt-ok-text"
  },
  "In Use": {
    label: "IN USE",
    barClass: "llt-card-statusbar--out",
    badgeClass: "llt-badge-info",
    textClass: "llt-info-text"
  },
  "Overdue": {
    label: "OVERDUE",
    barClass: "llt-card-statusbar--repair",
    badgeClass: "llt-badge-error",
    textClass: "llt-error-text"
  },
  "Expired": {
    label: "EXPIRED",
    barClass: "llt-card-statusbar--repair",
    badgeClass: "llt-badge-error",
    textClass: "llt-error-text"
  },
  "Repair": {
    label: "REPAIR",
    barClass: "llt-card-statusbar--repair",
    badgeClass: "llt-badge-warning",
    textClass: "llt-warning-text"
  }
};

export function getStatusConfig(status: CanonicalEquipmentStatus) {
  return StatusConfig[status];
}
