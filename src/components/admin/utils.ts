import type {
  AdminAuditSeverity,
  AdminRecentActivityItem,
  AdminRiskLevel,
} from '@/types/admin-dashboard';

export const ADMIN_CARD_CLASS =
  'rounded-xl border border-slate-700/60 bg-[#1A1D27] p-6 shadow-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-md';

export const ADMIN_TOOLTIP_STYLE = {
  background: '#1E2130',
  border: '1px solid #2D3148',
  color: '#F1F5F9',
  borderRadius: '8px',
};

export function formatCount(value: number) {
  return value.toLocaleString();
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function trendTone(value: number) {
  return value >= 0 ? 'text-emerald-400' : 'text-red-400';
}

export function trendArrow(value: number) {
  return value >= 0 ? '▲' : '▼';
}

export function roleBadge(role: string) {
  switch (role) {
    case 'admin':
      return 'bg-red-900/60 text-red-300 border border-red-700';
    case 'analyst':
      return 'bg-blue-900/60 text-blue-300 border border-blue-700';
    case 'org_manager':
      return 'bg-amber-900/60 text-amber-300 border border-amber-700';
    default:
      return 'bg-slate-800 text-slate-400 border border-slate-600';
  }
}

export function statusBadge(status: string) {
  switch (status) {
    case 'active':
      return 'bg-emerald-900/60 text-emerald-300 border border-emerald-700';
    case 'pending':
      return 'bg-yellow-900/60 text-yellow-300 border border-yellow-700';
    case 'suspended':
      return 'bg-red-900/60 text-red-300 border border-red-700';
    default:
      return 'bg-slate-800 text-slate-300 border border-slate-600';
  }
}

export function planBadge(plan: string) {
  switch (plan) {
    case 'enterprise':
      return 'bg-emerald-900/60 text-emerald-300 border border-emerald-700';
    case 'professional':
      return 'bg-violet-900/60 text-violet-300 border border-violet-700';
    case 'starter':
      return 'bg-blue-900/60 text-blue-300 border border-blue-700';
    default:
      return 'bg-slate-800 text-slate-300 border border-slate-600';
  }
}

export function riskBadge(risk: string) {
  switch (risk) {
    case 'low':
      return 'bg-emerald-900/50 text-emerald-300 border border-emerald-700';
    case 'medium':
      return 'bg-yellow-900/50 text-yellow-300 border border-yellow-700';
    case 'high':
      return 'bg-orange-900/50 text-orange-300 border border-orange-700';
    case 'critical':
      return 'bg-red-900/50 text-red-300 border border-red-700';
    default:
      return 'bg-slate-800 text-slate-300 border border-slate-600';
  }
}

export function riskColor(risk: string) {
  switch (risk as AdminRiskLevel) {
    case 'low':
      return '#22C55E';
    case 'medium':
      return '#EAB308';
    case 'high':
      return '#F97316';
    case 'critical':
      return '#EF4444';
    default:
      return '#64748B';
  }
}

export function severityColor(severity: AdminAuditSeverity) {
  switch (severity) {
    case 'critical':
      return 'bg-red-500';
    case 'warning':
      return 'bg-amber-500';
    default:
      return 'bg-blue-500';
  }
}

export function relativeTime(timestamp: string) {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return 'Just now';
  if (diffMs < hour) {
    const value = Math.floor(diffMs / minute);
    return `${value} min ago`;
  }
  if (diffMs < day) {
    const value = Math.floor(diffMs / hour);
    return `${value} hr ago`;
  }
  if (diffMs < day * 2) return 'Yesterday';
  if (diffMs < day * 7) {
    const value = Math.floor(diffMs / day);
    return `${value} days ago`;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(timestamp));
}

export function recentActivityTone(item: AdminRecentActivityItem) {
  if (item.type === 'audit' && item.severity === 'critical') {
    return 'border-red-500 bg-red-950/20';
  }

  if (item.type === 'audit' && item.severity === 'warning') {
    return 'border-amber-500 bg-amber-950/10';
  }

  return 'border-slate-700/60 bg-slate-900/30';
}
