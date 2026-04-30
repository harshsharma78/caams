import type { UserRole } from '@/types';

export function canViewDashboard(role?: UserRole | null) {
  return role === 'admin' || role === 'assessor';
}

export function canManageOrganizations(role?: UserRole | null) {
  return role === 'admin';
}

export function canManageInterviews(role?: UserRole | null) {
  return role === 'admin';
}

export function isAdmin(role?: UserRole | null) {
  return role === 'admin';
}
