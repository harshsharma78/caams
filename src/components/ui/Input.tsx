import * as React from 'react';

import { cn } from '@/lib/utils';

type BaseFieldProps = {
  label?: string;
  error?: string;
};

type InputProps = BaseFieldProps & React.ComponentProps<'input'>;
type TextareaProps = BaseFieldProps & React.ComponentProps<'textarea'>;

const fieldBaseClasses =
  'flex h-10 w-full cursor-text rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, type, ...props }, ref) => {
    const control = (
      <input
        ref={ref}
        type={type}
        className={cn(fieldBaseClasses, className)}
        {...props}
      />
    );

    if (!label) {
      return control;
    }

    return (
      <label className='block space-y-1.5'>
        <span className='text-sm font-medium text-slate-700 dark:text-slate-200'>
          {label}
        </span>
        {control}
        {error ? <p className='text-sm text-rose-600'>{error}</p> : null}
      </label>
    );
  },
);

Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, rows = 4, ...props }, ref) => {
    const control = (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          'cursor-text',
          className,
        )}
        {...props}
      />
    );

    if (!label) {
      return control;
    }

    return (
      <label className='block space-y-1.5'>
        <span className='text-sm font-medium text-slate-700 dark:text-slate-200'>
          {label}
        </span>
        {control}
        {error ? <p className='text-sm text-rose-600'>{error}</p> : null}
      </label>
    );
  },
);

Textarea.displayName = 'Textarea';
