import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { InterviewForm } from '@/components/forms/InterviewForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { canManageInterviews } from '@/lib/permissions';
import Organization from '@/models/Organization';

export const metadata: Metadata = {
  title: 'CAAMS | New Interview',
};

export default async function NewInterviewPage() {
  const session = await auth();

  if (!session?.user || !canManageInterviews(session.user.role)) {
    redirect('/interviews');
  }

  await dbConnect();

  const organizations = await Organization.find({}).sort({ name: 1 }).lean();

  return (
    <div className='space-y-8'>
      <PageHeader
        title='New interview'
        description='Record a structured IT professional interview about cloud computing experiences.'
      />
      <InterviewForm
        organizations={organizations.map((org) => ({
          id: org._id.toString(),
          name: org.name,
        }))}
      />
    </div>
  );
}
