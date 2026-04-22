import type { AdminDashboardData } from '@/types/admin-dashboard';
import type { DashboardStatsResponse } from '@/types/dashboard';

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

let dashboardStatsCache: CacheEntry<DashboardStatsResponse> | null = null;
let adminStatsCache: CacheEntry<AdminDashboardData> | null = null;

export function getDashboardStatsCache() {
  return dashboardStatsCache;
}

export function setDashboardStatsCache(cache: CacheEntry<DashboardStatsResponse>) {
  dashboardStatsCache = cache;
}

export function clearDashboardStatsCache() {
  dashboardStatsCache = null;
}

export function getAdminStatsCache() {
  return adminStatsCache;
}

export function setAdminStatsCache(cache: CacheEntry<AdminDashboardData>) {
  adminStatsCache = cache;
}

export function clearAdminStatsCache() {
  adminStatsCache = null;
}

export function clearAllStatsCaches() {
  clearDashboardStatsCache();
  clearAdminStatsCache();
}
