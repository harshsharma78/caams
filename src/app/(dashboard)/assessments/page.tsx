import { AssessmentList } from '@/components/assessments/AssessmentList';
import { PageHeader } from '@/components/layout/PageHeader';
import { getScoreInterpretation } from '@/lib/assessmentEngine';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Assessment from '@/models/Assessment';
import Organization from '@/models/Organization';

export default async function AssessmentsPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  await dbConnect();

  const [assessments, organizations] = await Promise.all([
    Assessment.find({})
      .populate('orgId', 'name')
      .sort({ createdAt: -1 })
      .lean(),
    Organization.find({}).sort({ name: 1 }).lean(),
  ]);

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Assessments'
        description='Review cloud readiness scores, compare organizations, and inspect assessment outcomes.'
        actionHref='/assessments/new'
        actionLabel='New assessment'
      />
      <AssessmentList
        assessments={assessments
          .filter(
            (assessment) =>
              assessment.orgId &&
              typeof assessment.orgId === 'object' &&
              'name' in assessment.orgId,
          )
          .map((assessment) => {
            const interpretation = getScoreInterpretation(
              assessment.overallScore,
            );

            return {
              id: assessment._id.toString(),
              organizationId: assessment.orgId._id.toString(),
              organizationName: assessment.orgId.name,
              overallScore: assessment.overallScore,
              status: assessment.status,
              statusLabel: interpretation.label,
              statusColor: interpretation.color,
              recommendation: assessment.recommendation,
              createdAt: assessment.createdAt.toISOString(),
            };
          })}
        organizations={organizations.map((organization) => ({
          id: organization._id.toString(),
          name: organization.name,
        }))}
      />
    </div>
  );
}
