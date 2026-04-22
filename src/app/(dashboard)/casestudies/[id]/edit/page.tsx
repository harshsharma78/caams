import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { CaseStudyForm } from '@/components/casestudies/CaseStudyForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { canManageOrganizations } from '@/lib/permissions';
import CaseStudy from '@/models/CaseStudy';

export const metadata: Metadata = {
  title: 'CAAMS | Edit Case Study',
};

export default async function EditCaseStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user || !canManageOrganizations(session.user.role)) {
    redirect('/casestudies');
  }

  const { id } = await params;

  await dbConnect();

  const caseStudy = await CaseStudy.findById(id).lean();

  if (!caseStudy) {
    notFound();
  }

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Edit case study'
        description='Update the narrative, results, and supporting file for this case study.'
      />
      <CaseStudyForm
        mode='edit'
        caseStudyId={caseStudy._id.toString()}
        initialValues={{
          title: caseStudy.title,
          organization: caseStudy.organization,
          sector: caseStudy.sector,
          challenge: caseStudy.challenge,
          solution: caseStudy.solution,
          outcome: caseStudy.outcome,
          results: caseStudy.results,
          tags: caseStudy.tags,
          fileUrl: caseStudy.fileUrl,
        }}
      />
    </div>
  );
}
