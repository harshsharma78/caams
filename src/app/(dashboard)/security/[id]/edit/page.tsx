import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { PageHeader } from '@/components/layout/PageHeader';
import { SecurityAssessmentForm } from '@/components/security/SecurityAssessmentForm';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { canManageOrganizations } from '@/lib/permissions';
import Organization from '@/models/Organization';
import SecurityCheck from '@/models/SecurityCheck';
import type { SecurityChecklistItem } from '@/types';

export const metadata: Metadata = {
  title: 'CAAMS | Edit Security Assessment',
};

export default async function EditSecurityAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user || !canManageOrganizations(session.user.role)) {
    redirect('/security');
  }

  const { id } = await params;

  await dbConnect();

  const [organizations, assessment] = await Promise.all([
    Organization.find({}).sort({ name: 1 }).lean(),
    SecurityCheck.findById(id).lean(),
  ]);

  if (!assessment) {
    notFound();
  }

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Edit security assessment'
        description='Update security checklist responses, notes, and organization selection.'
      />
      {organizations.length ? (
        <SecurityAssessmentForm
          mode='edit'
          assessmentId={assessment._id.toString()}
          organizations={organizations.map((organization) => ({
            id: organization._id.toString(),
            name: organization.name,
          }))}
          initialValues={{
            orgId: assessment.orgId.toString(),
            checklist: assessment.checklist.map(
              (item: {
                category: string;
                item: string;
                status: SecurityChecklistItem['status'];
                notes: string;
              }) => ({
                category: item.category,
                item: item.item,
                status: item.status,
                notes: item.notes,
              }),
            ),
          }}
        />
      ) : (
        <Card>
          <CardContent className='space-y-4 py-12 text-center'>
            <p className='text-sm text-slate-500 dark:text-slate-400'>
              Create an organization before editing this security assessment.
            </p>
            <Button asChild>
              <Link href='/organizations/new'>Add organization</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
