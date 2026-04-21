'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Organization {
  id: string;
  name: string;
}

interface AssessmentCategory {
  name: string;
  averageScore: number;
  percentageScore: number;
  weightedScore: number;
}

interface AssessmentItem {
  id: string;
  overallScore: number;
  status: string;
  statusLabel: string;
  recommendation: string;
  createdAt: string;
  assessor: { name: string; email: string } | null;
  categories: AssessmentCategory[];
}

interface KeyFinding {
  interviewee: string;
  question: string;
  answer: string;
}

interface CaseStudyItem {
  id: string;
  title: string;
  organization: string;
  sector: string;
  outcome: string;
}

interface ReportData {
  organization: {
    id: string;
    name: string;
    industry: string;
    size: string;
    sector: string;
    address: string;
    contactPerson: string;
    email: string;
    phone: string;
  };
  assessments: AssessmentItem[];
  latestSecurityCheck: {
    id: string;
    overallRisk: string;
    score: number;
    findings: string[];
    recommendations: string[];
    createdAt: string;
  } | null;
  interviewCount: number;
  keyFindings: KeyFinding[];
  caseStudies: CaseStudyItem[];
  summary: {
    avgScore: number;
    statusLabel: string;
    recommendation: string;
    totalAssessments: number;
    totalInterviews: number;
    totalSecurityChecks: number;
  };
}

interface ReportGeneratorProps {
  organizations: Organization[];
}

export function ReportGenerator({ organizations }: ReportGeneratorProps) {
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateReport = async () => {
    if (!selectedOrgId) {
      setError('Select an organization first.');
      return;
    }

    setError('');
    setIsLoading(true);
    setReport(null);

    try {
      const response = await fetch(`/api/reports/${selectedOrgId}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? 'Failed to generate report.');
        return;
      }

      setReport(data as ReportData);
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportPDF = () => {
    if (!report) return;

    const doc = new jsPDF();
    const org = report.organization;
    let y = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`Cloud Readiness Report`, 14, y);
    y += 10;
    doc.setFontSize(14);
    doc.text(org.name, 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Generated: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}`,
      14,
      y,
    );
    y += 12;

    // Organization details
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Organization Details', 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Field', 'Value']],
      body: [
        ['Industry', org.industry],
        ['Size', org.size.toUpperCase()],
        ['Sector', org.sector],
        ['Contact', org.contactPerson],
        ['Email', org.email],
        ['Phone', org.phone],
        ['Address', org.address],
      ],
      theme: 'striped',
      headStyles: { fillColor: [14, 165, 233] },
      styles: { fontSize: 9 },
    });

    y =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 12;

    // Summary
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Value']],
      body: [
        ['Average Score', `${report.summary.avgScore} / 100`],
        ['Status', report.summary.statusLabel],
        ['Total Assessments', String(report.summary.totalAssessments)],
        ['Total Interviews', String(report.summary.totalInterviews)],
        ['Security Checks', String(report.summary.totalSecurityChecks)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [14, 165, 233] },
      styles: { fontSize: 9 },
    });

    y =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 12;

    // Assessments table
    if (report.assessments.length > 0) {
      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Assessment History', 14, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [['Date', 'Score', 'Status', 'Assessor']],
        body: report.assessments.map((a) => [
          new Date(a.createdAt).toLocaleDateString('en-IN'),
          `${a.overallScore.toFixed(1)}`,
          a.statusLabel,
          a.assessor?.name ?? '—',
        ]),
        theme: 'striped',
        headStyles: { fillColor: [14, 165, 233] },
        styles: { fontSize: 9 },
      });

      y =
        (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
          .finalY + 12;
    }

    // Recommendation
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Recommendation', 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const lines = doc.splitTextToSize(report.summary.recommendation, 180);
    doc.text(lines, 14, y);

    doc.save(`${org.name.replace(/\s+/g, '_')}_Report.pdf`);
  };

  const riskBadge: Record<string, string> = {
    low: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    medium: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    high: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    critical: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  };

  return (
    <div className='space-y-6'>
      {/* Controls */}
      <Card>
        <CardContent className='flex flex-col gap-4 py-5 md:flex-row md:items-end'>
          <label className='block min-w-60 space-y-1.5'>
            <span className='text-sm font-medium text-slate-700 dark:text-slate-200'>
              Organization
            </span>
            <Select
              value={selectedOrgId}
              onValueChange={setSelectedOrgId}>
              <SelectTrigger>
                <SelectValue placeholder='Select an organization' />
              </SelectTrigger>
              <SelectContent className='border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50'>
                {organizations.map((org) => (
                  <SelectItem
                    key={org.id}
                    value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <Button
            onClick={generateReport}
            disabled={isLoading || !selectedOrgId}>
            {isLoading ? (
              <>
                <Spinner className='h-4 w-4' />
                Generating...
              </>
            ) : (
              'Generate Report'
            )}
          </Button>
          {report ? (
            <Button
              variant='outline'
              onClick={exportPDF}>
              Export as PDF
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {error ? <p className='text-sm text-rose-600'>{error}</p> : null}

      {/* Report Content */}
      {report ? (
        <div className='space-y-6'>
          {/* Organization details */}
          <Card>
            <CardHeader>
              <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
                {report.organization.name}
              </h2>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                {report.organization.industry} •{' '}
                {report.organization.size.toUpperCase()} •{' '}
                {report.organization.sector}
              </p>
            </CardHeader>
            <CardContent>
              <dl className='grid gap-3 text-sm sm:grid-cols-2'>
                <div>
                  <dt className='font-medium text-slate-500 dark:text-slate-400'>
                    Contact
                  </dt>
                  <dd className='text-slate-900 dark:text-slate-50'>
                    {report.organization.contactPerson}
                  </dd>
                </div>
                <div>
                  <dt className='font-medium text-slate-500 dark:text-slate-400'>
                    Email
                  </dt>
                  <dd className='text-slate-900 dark:text-slate-50'>
                    {report.organization.email}
                  </dd>
                </div>
                <div>
                  <dt className='font-medium text-slate-500 dark:text-slate-400'>
                    Phone
                  </dt>
                  <dd className='text-slate-900 dark:text-slate-50'>
                    {report.organization.phone}
                  </dd>
                </div>
                <div>
                  <dt className='font-medium text-slate-500 dark:text-slate-400'>
                    Address
                  </dt>
                  <dd className='text-slate-900 dark:text-slate-50'>
                    {report.organization.address}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Summary card */}
          <div className='grid gap-4 md:grid-cols-4'>
            <Card className='overflow-hidden'>
              <CardContent className='p-0'>
                <div className='h-1.5 bg-gradient-to-r from-sky-500 to-cyan-400' />
                <div className='space-y-1 p-5'>
                  <p className='text-sm text-slate-500'>Avg Score</p>
                  <p className='text-3xl font-semibold text-slate-900 dark:text-slate-50'>
                    {report.summary.avgScore}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className='overflow-hidden'>
              <CardContent className='p-0'>
                <div className='h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400' />
                <div className='space-y-1 p-5'>
                  <p className='text-sm text-slate-500'>Status</p>
                  <p className='text-lg font-semibold text-slate-900 dark:text-slate-50'>
                    {report.summary.statusLabel}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className='overflow-hidden'>
              <CardContent className='p-0'>
                <div className='h-1.5 bg-gradient-to-r from-violet-500 to-purple-400' />
                <div className='space-y-1 p-5'>
                  <p className='text-sm text-slate-500'>Assessments</p>
                  <p className='text-3xl font-semibold text-slate-900 dark:text-slate-50'>
                    {report.summary.totalAssessments}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className='overflow-hidden'>
              <CardContent className='p-0'>
                <div className='h-1.5 bg-gradient-to-r from-amber-500 to-orange-400' />
                <div className='space-y-1 p-5'>
                  <p className='text-sm text-slate-500'>Interviews</p>
                  <p className='text-3xl font-semibold text-slate-900 dark:text-slate-50'>
                    {report.summary.totalInterviews}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assessments table */}
          {report.assessments.length > 0 ? (
            <Card>
              <CardHeader>
                <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-50'>
                  Assessment History
                </h2>
              </CardHeader>
              <CardContent className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-slate-200 dark:divide-slate-800'>
                  <thead className='bg-slate-50 dark:bg-slate-950'>
                    <tr className='text-left text-xs uppercase tracking-widest text-slate-500'>
                      <th className='px-4 py-3'>Date</th>
                      <th className='px-4 py-3'>Score</th>
                      <th className='px-4 py-3'>Status</th>
                      <th className='px-4 py-3'>Assessor</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-slate-100 text-sm dark:divide-slate-800'>
                    {report.assessments.map((a) => (
                      <tr key={a.id}>
                        <td className='px-4 py-3 text-slate-600 dark:text-slate-300'>
                          {new Date(a.createdAt).toLocaleDateString('en-IN', {
                            dateStyle: 'medium',
                          })}
                        </td>
                        <td className='px-4 py-3 font-medium text-slate-900 dark:text-slate-50'>
                          {a.overallScore.toFixed(1)}
                        </td>
                        <td className='px-4 py-3'>{a.statusLabel}</td>
                        <td className='px-4 py-3 text-slate-500'>
                          {a.assessor?.name ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ) : null}

          {/* Latest Security Assessment */}
          {report.latestSecurityCheck ? (
            <Card>
              <CardHeader>
                <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-50'>
                  Latest Security Assessment
                </h2>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center gap-3'>
                  <span className='text-sm font-medium text-slate-500'>
                    Overall Risk:
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${riskBadge[report.latestSecurityCheck.overallRisk] ?? ''}`}>
                    {report.latestSecurityCheck.overallRisk}
                  </span>
                </div>
                {report.latestSecurityCheck.findings.length > 0 ? (
                  <div>
                    <p className='mb-2 text-sm font-medium text-slate-700 dark:text-slate-200'>
                      Findings
                    </p>
                    <ul className='list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-300'>
                      {report.latestSecurityCheck.findings.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {report.latestSecurityCheck.recommendations.length > 0 ? (
                  <div>
                    <p className='mb-2 text-sm font-medium text-slate-700 dark:text-slate-200'>
                      Recommendations
                    </p>
                    <ul className='list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-300'>
                      {report.latestSecurityCheck.recommendations.map(
                        (r, i) => (
                          <li key={i}>{r}</li>
                        ),
                      )}
                    </ul>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {/* Key interview findings */}
          {report.keyFindings.length > 0 ? (
            <Card>
              <CardHeader>
                <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-50'>
                  Key Interview Findings
                </h2>
                <p className='text-sm text-slate-500'>
                  {report.interviewCount} interview
                  {report.interviewCount !== 1 ? 's' : ''} conducted
                </p>
              </CardHeader>
              <CardContent className='space-y-4'>
                {report.keyFindings.map((finding, index) => (
                  <div
                    key={index}
                    className='rounded-xl border border-slate-200 p-4 dark:border-slate-800'>
                    <p className='mb-1 text-xs font-medium text-sky-600 dark:text-sky-400'>
                      {finding.interviewee}
                    </p>
                    <p className='mb-2 text-sm font-medium text-slate-900 dark:text-slate-50'>
                      {finding.question}
                    </p>
                    <p className='text-sm text-slate-600 dark:text-slate-300'>
                      {finding.answer}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {/* Case studies */}
          {report.caseStudies.length > 0 ? (
            <Card>
              <CardHeader>
                <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-50'>
                  Related Case Studies
                </h2>
              </CardHeader>
              <CardContent className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-slate-200 dark:divide-slate-800'>
                  <thead className='bg-slate-50 dark:bg-slate-950'>
                    <tr className='text-left text-xs uppercase tracking-widest text-slate-500'>
                      <th className='px-4 py-3'>Title</th>
                      <th className='px-4 py-3'>Organization</th>
                      <th className='px-4 py-3'>Sector</th>
                      <th className='px-4 py-3'>Outcome</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-slate-100 text-sm dark:divide-slate-800'>
                    {report.caseStudies.map((cs) => (
                      <tr key={cs.id}>
                        <td className='px-4 py-3 font-medium text-slate-900 dark:text-slate-50'>
                          {cs.title}
                        </td>
                        <td className='px-4 py-3 text-slate-600 dark:text-slate-300'>
                          {cs.organization}
                        </td>
                        <td className='px-4 py-3 text-slate-500'>
                          {cs.sector}
                        </td>
                        <td className='max-w-xs truncate px-4 py-3 text-slate-600 dark:text-slate-300'>
                          {cs.outcome}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ) : null}

          {/* Recommendation */}
          <Card>
            <CardHeader>
              <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-50'>
                Overall Recommendation
              </h2>
            </CardHeader>
            <CardContent>
              <p className='text-sm leading-relaxed text-slate-600 dark:text-slate-300'>
                {report.summary.recommendation}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
