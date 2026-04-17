import Link from 'next/link';

import { AssessmentForm } from '@/components/assessments/AssessmentForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Organization from '@/models/Organization';

export default async function NewAssessmentPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  await dbConnect();

  const organizations = await Organization.find({}).sort({ name: 1 }).lean();

  return (
    <div className='space-y-8'>
      <PageHeader
        title='New assessment'
        description='Complete the six-step readiness review and save a weighted cloud readiness score.'
      />
      {organizations.length ? (
        <AssessmentForm
          organizations={organizations.map((organization) => ({
            id: organization._id.toString(),
            name: organization.name,
          }))}
        />
      ) : (
        <Card>
          <CardContent className='space-y-3 py-10 text-center'>
            <p className='text-lg font-semibold text-slate-900 dark:text-slate-50'>
              Create an organization before starting an assessment.
            </p>
            <p className='text-sm text-slate-600 dark:text-slate-300'>
              Assessments are linked to organization records, so the module
              needs at least one organization profile to proceed.
            </p>
            <div>
              <Link
                href='/organizations/new'
                className='font-medium text-sky-600 transition hover:text-sky-700'>
                Add organization
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
