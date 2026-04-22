import type {
  DashboardActivityType,
  DashboardRiskLevel,
} from '@/types/dashboard';

export function formatNumber(value: number) {
  return value.toLocaleString();
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatRiskLabel(risk: DashboardRiskLevel) {
  if (risk === 'unknown') {
    return 'Unknown';
  }

  return risk.charAt(0).toUpperCase() + risk.slice(1);
}

export function getRiskClasses(risk: DashboardRiskLevel) {
  switch (risk) {
    case 'low':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    case 'medium':
      return 'bg-amber-50 text-amber-700 ring-amber-200';
    case 'high':
      return 'bg-orange-50 text-orange-700 ring-orange-200';
    case 'critical':
      return 'bg-rose-50 text-rose-700 ring-rose-200';
    default:
      return 'bg-slate-100 text-slate-700 ring-slate-200';
  }
}

export function getRiskColor(risk: DashboardRiskLevel) {
  switch (risk) {
    case 'low':
      return '#22C55E';
    case 'medium':
      return '#EAB308';
    case 'high':
      return '#F97316';
    case 'critical':
      return '#EF4444';
    default:
      return '#94A3B8';
  }
}

export function getActivityColor(type: DashboardActivityType) {
  switch (type) {
    case 'organization':
      return 'bg-blue-500';
    case 'assessment':
      return 'bg-violet-500';
    case 'interview':
      return 'bg-amber-500';
    case 'casestudy':
      return 'bg-emerald-500';
    case 'security':
      return 'bg-rose-500';
  }
}

export function getRelativeTime(timestamp: string) {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) {
    return 'Just now';
  }

  if (diffMs < hour) {
    const minutes = Math.floor(diffMs / minute);
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  if (diffMs < day * 2) {
    return 'Yesterday';
  }

  if (diffMs < day * 7) {
    const days = Math.floor(diffMs / day);
    return `${days} days ago`;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(timestamp));
}

export function getScoreBarColor(score: number) {
  if (score >= 81) {
    return 'bg-emerald-500';
  }

  if (score >= 61) {
    return 'bg-amber-400';
  }

  if (score >= 41) {
    return 'bg-orange-500';
  }

  return 'bg-rose-500';
}
