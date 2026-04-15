'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/use-toast';
import { loginSchema } from '@/lib/validations';

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';
  const { toast } = useToast();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginValues) => {
    const result = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      toast({
        title: 'Login failed',
        description: 'Incorrect email or password.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Signed in',
      description: 'Welcome back to the CAAMS workspace.',
    });

    router.replace(callbackUrl);
    router.refresh();
  };

  return (
    <div className='grid min-h-screen place-items-center bg-[#111827] px-4 py-10'>
      <div className='w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-8 shadow-2xl shadow-black/40'>
        <div className='mb-8 text-center'>
          <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-slate-100'>
            <ShieldCheck className='h-7 w-7' />
          </div>
          <h1 className='mb-3 text-4xl font-extrabold tracking-tight text-slate-50'>
            Welcome Back to CAAMS
          </h1>
          <p className='text-sm text-slate-400'>
            Sign in to continue managing cloud adoption assessments.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-slate-200'>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='email'
                      placeholder='Enter Email Address'
                      autoComplete='email'
                      className='border-slate-800 bg-slate-900 text-slate-50 placeholder:text-slate-500 focus-visible:ring-slate-700'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-slate-200'>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='password'
                      placeholder='Enter Password'
                      autoComplete='current-password'
                      className='border-slate-800 bg-slate-900 text-slate-50 placeholder:text-slate-500 focus-visible:ring-slate-700'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type='submit'
              className='w-full bg-slate-100 text-slate-950 hover:bg-white disabled:bg-slate-700 disabled:text-slate-400 disabled:hover:bg-slate-700'
              disabled={form.formState.isSubmitting || !form.formState.isValid}>
              {form.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
              <ArrowRight className='h-4 w-4' />
            </Button>
          </form>
        </Form>

        <div className='mt-6 rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm text-slate-400'>
          <div className='flex items-start gap-2'>
            <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
            <p>Only authenticated CAAMS users can access the dashboard.</p>
          </div>
        </div>

        <div className='mt-6 text-center text-sm text-slate-400'>
          Not a member yet?
          <Link
            href='/register'
            className='ml-1 font-medium text-blue-400 hover:text-blue-300'>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
