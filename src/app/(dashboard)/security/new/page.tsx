import Link from 'next/link';
import { redirect } from 'next/navigation';

import { PageHeader } from '@/components/layout/PageHeader';
import { SecurityAssessmentForm } from '@/components/security/SecurityAssessmentForm';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { canManageOrganizations } from '@/lib/permissions';
import Organization from '@/models/Organization';

export default async function NewSecurityAssessmentPage() {
  const session = await auth();

  if (!session?.user || !canManageOrganizations(session.user.role)) {
    redirect('/security');
  }

  await dbConnect();

  const organizations = await Organization.find({}).sort({ name: 1 }).lean();

  return (
    <div className='space-y-8'>
      <PageHeader
        title='New security assessment'
        description='Run the full 30-point checklist, capture evidence, and calculate organization risk automatically.'
      />
      {organizations.length ? (
        <SecurityAssessmentForm
          organizations={organizations.map((organization) => ({
            id: organization._id.toString(),
            name: organization.name,
          }))}
        />
      ) : (
        <Card>
          <CardContent className='space-y-4 py-12 text-center'>
            <p className='text-sm text-slate-500 dark:text-slate-400'>
              Create an organization before starting a security assessment.
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
