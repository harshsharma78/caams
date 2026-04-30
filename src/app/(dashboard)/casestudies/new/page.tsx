import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { CaseStudyForm } from '@/components/casestudies/CaseStudyForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { canManageOrganizations } from '@/lib/permissions';
import Organization from '@/models/Organization';

export const metadata: Metadata = {
  title: 'CAAMS | New Case Study',
};

export default async function NewCaseStudyPage() {
  const session = await auth();

  if (!session?.user || !canManageOrganizations(session.user.role)) {
    redirect('/casestudies');
  }

  await dbConnect();

  const organizations = await Organization.find({})
    .sort({ name: 1 })
    .lean();

  return (
    <div className='space-y-8'>
      <PageHeader
        title='New case study'
        description='Document a cloud adoption story with searchable tags, rich context, and an attached PDF reference.'
      />
      <CaseStudyForm
        organizations={organizations.map((org) => ({
          id: org._id.toString(),
          name: org.name,
        }))}
      />
    </div>
  );
}
