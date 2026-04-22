import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { ReportGenerator } from '@/components/reports/ReportGenerator';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Organization from '@/models/Organization';

export const metadata: Metadata = {
  title: 'CAAMS | Reports',
};

export default async function ReportsPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  await dbConnect();

  const organizations = await Organization.find({}).sort({ name: 1 }).lean();

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Reports'
        description='Generate detailed cloud readiness reports for any organization.'
      />
      <ReportGenerator
        organizations={organizations.map((org) => ({
          id: org._id.toString(),
          name: org.name,
        }))}
      />
    </div>
  );
}
