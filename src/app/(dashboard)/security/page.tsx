import { PageHeader } from '@/components/layout/PageHeader';
import { SecurityAssessmentList } from '@/components/security/SecurityAssessmentList';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import SecurityCheck from '@/models/SecurityCheck';

export default async function SecurityPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

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
        actionHref='/security/new'
        actionLabel='New assessment'
      />
      <SecurityAssessmentList
        assessments={assessments
          .filter(
            (assessment) =>
              assessment.orgId &&
              typeof assessment.orgId === 'object' &&
              'name' in assessment.orgId,
          )
          .map((assessment) => ({
            id: assessment._id.toString(),
            orgId: assessment.orgId._id.toString(),
            organizationName: assessment.orgId.name,
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
          }))}
      />
    </div>
  );
}
