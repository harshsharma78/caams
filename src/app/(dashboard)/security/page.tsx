import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { SecurityAssessmentList } from '@/components/security/SecurityAssessmentList';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { canManageOrganizations } from '@/lib/permissions';
import SecurityCheck from '@/models/SecurityCheck';

export const metadata: Metadata = {
  title: 'CAAMS | Security Assessments',
};

export default async function SecurityPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const canManage = canManageOrganizations(session.user.role);

  await dbConnect();

  const assessments = await SecurityCheck.find({})
    .populate('orgId', 'name')
    .populate('conductedBy', 'name email role')
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Security Assessments'
        description='Track cloud security posture by organization, review risk levels, and prioritize remediation work.'
        actionHref={canManage ? '/security/new' : undefined}
        actionLabel={canManage ? 'New assessment' : undefined}
      />
      <SecurityAssessmentList
        canManage={canManage}
        assessments={assessments
          .map((assessment) => {
            const hasOrg =
              assessment.orgId &&
              typeof assessment.orgId === 'object' &&
              'name' in assessment.orgId;

            return {
              id: assessment._id.toString(),
              orgId: hasOrg
                ? assessment.orgId._id.toString()
                : assessment.orgId?.toString() ?? '',
              organizationName: hasOrg
                ? assessment.orgId.name
                : 'Deleted Organization',
              score: assessment.score,
              overallRisk: assessment.overallRisk,
              createdAt: assessment.createdAt.toISOString(),
              conductedBy:
                assessment.conductedBy &&
                typeof assessment.conductedBy === 'object' &&
                '_id' in assessment.conductedBy
                  ? {
                      id: assessment.conductedBy._id.toString(),
                      name: assessment.conductedBy.name,
                      email: assessment.conductedBy.email,
                      role: assessment.conductedBy.role,
                    }
                  : null,
            };
          })}
      />
    </div>
  );
}
