import type { UserRole } from '@/types';

export function canViewDashboard(role?: UserRole | null) {
  return role === 'admin' || role === 'viewer';
}

export function canManageOrganizations(role?: UserRole | null) {
  return role === 'admin';
}

export function isAdmin(role?: UserRole | null) {
  return role === 'admin';
}
