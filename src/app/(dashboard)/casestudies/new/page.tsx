import { redirect } from 'next/navigation';

import { CaseStudyForm } from '@/components/casestudies/CaseStudyForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { auth } from '@/lib/auth';
import { canManageOrganizations } from '@/lib/permissions';

export default async function NewCaseStudyPage() {
  const session = await auth();

  if (!session?.user || !canManageOrganizations(session.user.role)) {
    redirect('/casestudies');
  }

  return (
    <div className='space-y-8'>
      <PageHeader
        title='New case study'
        description='Document a cloud adoption story with searchable tags, rich context, and an attached PDF reference.'
      />
      <CaseStudyForm />
    </div>
  );
}
