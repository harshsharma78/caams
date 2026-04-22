import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DeleteCaseStudyButton } from '@/components/casestudies/DeleteCaseStudyButton';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { canManageOrganizations } from '@/lib/permissions';
import CaseStudy from '@/models/CaseStudy';

export const metadata: Metadata = {
  title: 'CAAMS | Case Study Details',
};

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    notFound();
  }

  const canManage = canManageOrganizations(session.user.role);

  await dbConnect();

  const caseStudy = await CaseStudy.findById(id)
    .populate('uploadedBy', 'name email role')
    .lean();

  if (!caseStudy) {
    notFound();
  }

  const relatedCaseStudies = await CaseStudy.find({
    _id: { $ne: caseStudy._id },
    sector: caseStudy.sector,
  })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  const sections = [
    { title: 'Challenge', content: caseStudy.challenge },
    { title: 'Solution', content: caseStudy.solution },
    { title: 'Outcome', content: caseStudy.outcome },
  ];

  return (
    <div className='space-y-8'>
      <PageHeader
        title={caseStudy.title}
        description={`${caseStudy.organization} · ${caseStudy.sector}`}
        action={
          <div className='flex flex-wrap items-center gap-3'>
            {canManage ? (
              <>
                <Button
                  asChild
                  variant='outline'>
                  <Link href={`/casestudies/${caseStudy._id.toString()}/edit`}>
                    Edit case study
                  </Link>
                </Button>
                <DeleteCaseStudyButton
                  id={caseStudy._id.toString()}
                  title={caseStudy.title}
                />
              </>
            ) : null}
            {caseStudy.fileUrl ? (
              <Button asChild>
                <a
                  href={caseStudy.fileUrl}
                  target='_blank'
                  rel='noreferrer'>
                  Download PDF
                </a>
              </Button>
            ) : null}
          </div>
        }
      />

      <div className='grid gap-6 xl:grid-cols-[1fr_1fr]'>
        <Card>
          <CardContent className='space-y-8'>
            <div className='flex flex-wrap gap-2'>
              <Badge>{caseStudy.sector}</Badge>
              {caseStudy.tags.map((tag: string) => (
                <Badge
                  key={tag}
                  variant='outline'
                  className='border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300'>
                  #{tag}
                </Badge>
              ))}
            </div>

            {sections.map((section) => (
              <div
                key={section.title}
                className='space-y-2'>
                <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
                  {section.title}
                </h2>
                <div className='wrap-break-word whitespace-pre-wrap max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300'>
                  {section.content}
                </div>
              </div>
            ))}

            <div className='rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950'>
              <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
                Results
              </h2>
              <p className='mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300'>
                {caseStudy.results}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
                Reference details
              </h2>
            </CardHeader>
            <CardContent className='space-y-4 text-sm text-slate-600 dark:text-slate-300'>
              <div>
                <p className='font-medium text-slate-900 dark:text-slate-50'>
                  Organization
                </p>
                <p>{caseStudy.organization}</p>
              </div>
              <div>
                <p className='font-medium text-slate-900 dark:text-slate-50'>
                  Added
                </p>
                <p>
                  {new Intl.DateTimeFormat('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(caseStudy.createdAt)}
                </p>
              </div>
              {caseStudy.uploadedBy &&
              typeof caseStudy.uploadedBy === 'object' &&
              '_id' in caseStudy.uploadedBy ? (
                <div>
                  <p className='font-medium text-slate-900 dark:text-slate-50'>
                    Uploaded by
                  </p>
                  <p>{caseStudy.uploadedBy.name}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
                Related case studies
              </h2>
            </CardHeader>
            <CardContent className='space-y-4'>
              {relatedCaseStudies.length ? (
                relatedCaseStudies.map((relatedCaseStudy) => (
                  <Link
                    key={relatedCaseStudy._id.toString()}
                    href={`/casestudies/${relatedCaseStudy._id.toString()}`}
                    className='block rounded-2xl border border-slate-200 p-4 transition hover:border-sky-300 hover:bg-sky-50/60 dark:border-slate-800 dark:hover:border-sky-800 dark:hover:bg-sky-950/20'>
                    <p className='font-medium text-slate-900 dark:text-slate-50'>
                      {relatedCaseStudy.title}
                    </p>
                    <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
                      {relatedCaseStudy.organization}
                    </p>
                  </Link>
                ))
              ) : (
                <p className='text-sm text-slate-500 dark:text-slate-400'>
                  No related case studies found in this sector yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
