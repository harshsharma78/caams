'use client';

import { Button } from '@/components/ui/Button';

interface AssessmentActionsProps {
  fileName: string;
  exportPayload: string;
}

export function AssessmentActions({
  fileName,
  exportPayload,
}: AssessmentActionsProps) {
  return (
    <div className='flex gap-3'>
      <Button
        variant='outline'
        type='button'
        onClick={() => window.print()}>
        Print
      </Button>
      <Button
        type='button'
        onClick={() => {
          const blob = new Blob([exportPayload], {
            type: 'application/json;charset=utf-8',
          });
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = fileName;
          anchor.click();
          URL.revokeObjectURL(url);
        }}>
        Export
      </Button>
    </div>
  );
}
