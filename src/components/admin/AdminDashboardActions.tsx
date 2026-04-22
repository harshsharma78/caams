'use client';

import { Download, Printer, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { Button } from '@/components/ui/Button';
import type { AdminDashboardData } from '@/types/admin-dashboard';
import { formatCurrency } from '@/components/admin/utils';

export function AdminDashboardActions({
  data,
}: {
  data: AdminDashboardData;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const exportCsv = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Users', data.totalUsers.toString()],
      ['Active Users', data.activeUsers.toString()],
      ['New Users This Month', data.newUsersThisMonth.toString()],
      ['Pending Approvals', data.pendingApprovals.toString()],
      ['Suspended Users', data.suspendedUsers.toString()],
      ['Admin Count', data.adminCount.toString()],
      ['Total Organizations', data.totalOrganizations.toString()],
      ['Total Assessments', data.totalAssessments.toString()],
      ['Total Interviews', data.totalInterviews.toString()],
      ['Total Case Studies', data.totalCaseStudies.toString()],
      ['Total Security Checks', data.totalSecurityChecks.toString()],
      ['Platform Average Readiness', data.platformAverageReadiness.toFixed(1)],
      ['High Risk Organizations', data.highRiskOrganizations.toString()],
      ['Audit Events Today', data.auditEventsToday.toString()],
      ['Critical Alerts', data.criticalAlerts.toString()],
      ['Failed Logins', data.failedLoginAttempts.toString()],
      ['Monthly Revenue', formatCurrency(data.totalMonthlyRevenue)],
      ['Revenue Growth', `${data.revenueGrowth.toFixed(1)}%`],
      ['API Uptime', `${data.systemHealth.uptime.toFixed(1)}%`],
    ];

    const blob = new Blob(
      [rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')],
      { type: 'text/csv;charset=utf-8;' },
    );

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'caams-admin-dashboard.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div
      data-dashboard-actions
      className='flex flex-wrap items-center gap-3 print:hidden'>
      <Button
        variant='outline'
        className='border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700'
        onClick={() =>
          startTransition(() => {
            router.refresh();
          })
        }>
        <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
        Refresh Data
      </Button>
      <Button
        variant='outline'
        className='border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700'
        onClick={exportCsv}>
        <Download className='h-4 w-4' />
        Export Report
      </Button>
      <Button
        variant='outline'
        className='border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700'
        onClick={() => window.print()}>
        <Printer className='h-4 w-4' />
        Print Dashboard
      </Button>
    </div>
  );
}
