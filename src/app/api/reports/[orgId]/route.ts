import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { getScoreInterpretation } from '@/lib/assessmentEngine';
import { objectIdSchema } from '@/lib/validations';
import Assessment from '@/models/Assessment';
import CaseStudy from '@/models/CaseStudy';
import Interview from '@/models/Interview';
import Organization from '@/models/Organization';
import SecurityCheck from '@/models/SecurityCheck';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orgId: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { orgId } = await params;
    const parsed = objectIdSchema.safeParse(orgId);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid organization ID.' },
        { status: 400 },
      );
    }

    await dbConnect();

    const organization = await Organization.findById(parsed.data).lean();

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found.' },
        { status: 404 },
      );
    }

    const [assessments, interviews, securityChecks, caseStudies] =
      await Promise.all([
        Assessment.find({ orgId: parsed.data })
          .populate('assessorId', 'name email')
          .sort({ createdAt: -1 })
          .lean(),
        Interview.find({ orgId: parsed.data })
          .populate('conductedBy', 'name email')
          .sort({ date: -1 })
          .lean(),
        SecurityCheck.find({ orgId: parsed.data })
          .sort({ createdAt: -1 })
          .lean(),
        CaseStudy.find({
          sector: { $regex: new RegExp(organization.sector, 'i') },
        })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

    // Compute average score
    const totalScore = assessments.reduce((sum, a) => sum + a.overallScore, 0);
    const avgScore =
      assessments.length > 0
        ? Math.round((totalScore / assessments.length) * 10) / 10
        : 0;
    const interpretation = getScoreInterpretation(avgScore);

    // Generate recommendation
    let recommendation = 'No assessments completed yet.';
    if (assessments.length > 0) {
      const latestAssessment = assessments[0];
      recommendation = latestAssessment.recommendation;
    }

    // Extract key findings from interviews
    const keyFindings = interviews
      .flatMap((interview) =>
        interview.responses
          .filter(
            (r: { answer: string }) => r.answer && r.answer.trim().length > 20,
          )
          .slice(0, 2)
          .map((r: { question: string; answer: string }) => ({
            interviewee: interview.intervieweeName,
            question: r.question,
            answer: r.answer,
          })),
      )
      .slice(0, 5);

    return NextResponse.json({
      organization: {
        id: organization._id.toString(),
        name: organization.name,
        industry: organization.industry,
        size: organization.size,
        sector: organization.sector,
        address: organization.address,
        contactPerson: organization.contactPerson,
        email: organization.email,
        phone: organization.phone,
      },
      assessments: assessments.map((a) => {
        const interp = getScoreInterpretation(a.overallScore);
        return {
          id: a._id.toString(),
          overallScore: a.overallScore,
          status: a.status,
          statusLabel: interp.label,
          recommendation: a.recommendation,
          createdAt: a.createdAt.toISOString(),
          assessor:
            a.assessorId &&
            typeof a.assessorId === 'object' &&
            '_id' in a.assessorId
              ? { name: a.assessorId.name, email: a.assessorId.email }
              : null,
          categories: a.categories.map(
            (c: {
              name: string;
              averageScore: number;
              percentageScore: number;
              weightedScore: number;
            }) => ({
              name: c.name,
              averageScore: c.averageScore,
              percentageScore: c.percentageScore,
              weightedScore: c.weightedScore,
            }),
          ),
        };
      }),
      latestSecurityCheck:
        securityChecks.length > 0
          ? {
              id: securityChecks[0]._id.toString(),
              overallRisk: securityChecks[0].overallRisk,
              score: securityChecks[0].score,
              findings: securityChecks[0].findings,
              recommendations: securityChecks[0].recommendations,
              createdAt: securityChecks[0].createdAt.toISOString(),
            }
          : null,
      interviewCount: interviews.length,
      keyFindings,
      caseStudies: caseStudies.map((cs) => ({
        id: cs._id.toString(),
        title: cs.title,
        organization: cs.organization,
        sector: cs.sector,
        outcome: cs.outcome,
      })),
      summary: {
        avgScore,
        statusLabel: interpretation.label,
        recommendation,
        totalAssessments: assessments.length,
        totalInterviews: interviews.length,
        totalSecurityChecks: securityChecks.length,
      },
    });
  } catch (error) {
    console.error('Report GET error:', error);

    return NextResponse.json(
      { error: 'Failed to generate report.' },
      { status: 500 },
    );
  }
}
