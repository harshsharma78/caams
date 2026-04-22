import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { CaseStudyLibrary } from '@/components/casestudies/CaseStudyLibrary';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { canManageOrganizations } from '@/lib/permissions';
import CaseStudy from '@/models/CaseStudy';

export const metadata: Metadata = {
  title: 'CAAMS | Case Studies',
};

export default async function CaseStudiesPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const canManage = canManageOrganizations(session.user.role);

  await dbConnect();

  const caseStudies = await CaseStudy.find({})
    .populate('uploadedBy', 'name email role')
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Case Study Library'
        description='Search sector-specific cloud adoption examples, compare outcomes, and keep supporting documents close to assessment work.'
        actionHref={canManage ? '/casestudies/new' : undefined}
        actionLabel={canManage ? 'New case study' : undefined}
      />
      <CaseStudyLibrary
        canManage={canManage}
        caseStudies={caseStudies.map((caseStudy) => ({
          id: caseStudy._id.toString(),
          title: caseStudy.title,
          organization: caseStudy.organization,
          sector: caseStudy.sector,
          challenge: caseStudy.challenge,
          solution: caseStudy.solution,
          outcome: caseStudy.outcome,
          results: caseStudy.results,
          tags: caseStudy.tags,
          fileUrl: caseStudy.fileUrl,
          createdAt: caseStudy.createdAt.toISOString(),
          uploadedBy:
            caseStudy.uploadedBy &&
            typeof caseStudy.uploadedBy === 'object' &&
            '_id' in caseStudy.uploadedBy
              ? {
                  id: caseStudy.uploadedBy._id.toString(),
                  name: caseStudy.uploadedBy.name,
                  email: caseStudy.uploadedBy.email,
                  role: caseStudy.uploadedBy.role,
                }
              : null,
        }))}
      />
    </div>
  );
}
