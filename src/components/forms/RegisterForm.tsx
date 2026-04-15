'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ShieldEllipsis, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { registerSchema } from '@/lib/validations';

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'viewer',
    },
  });

  const onSubmit = async (values: RegisterValues) => {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    const data = (await response.json()) as {
      error?: string;
      message?: string;
    };

    if (!response.ok) {
      toast({
        title: 'Registration failed',
        description: data.error ?? 'Unable to create account.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Account created',
      description: data.message ?? 'You can now sign in to CAAMS.',
    });

    router.replace('/login?registered=1');
  };

  return (
    <div className='grid min-h-screen place-items-center bg-[#111827] px-4 py-10'>
      <div className='w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-8 shadow-2xl shadow-black/40'>
        <div className='mb-8 text-center'>
          <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-slate-100'>
            <UserPlus className='h-7 w-7' />
          </div>
          <h1 className='mb-3 text-4xl font-extrabold tracking-tight text-slate-50'>
            Join CAAMS
          </h1>
          <p className='text-sm text-slate-400'>
            Register to access the cloud adoption assessment workspace.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-slate-200'>Full name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='Enter Full Name'
                      className='border-slate-800 bg-slate-900 text-slate-50 placeholder:text-slate-500 focus-visible:ring-slate-700'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                  <FormDescription className='text-slate-500'>
                    This email is used for credentials-based sign-in.
                  </FormDescription>
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
                      autoComplete='new-password'
                      className='border-slate-800 bg-slate-900 text-slate-50 placeholder:text-slate-500 focus-visible:ring-slate-700'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-slate-200'>Role</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <SelectTrigger className='border-slate-800 bg-slate-900 text-slate-50 focus:ring-slate-700'>
                        <SelectValue placeholder='Select a role' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='viewer'>Viewer</SelectItem>
                        <SelectItem value='admin'>Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription className='text-slate-500'>
                    New users default to viewer unless the first user or an
                    existing admin assigns admin access.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type='submit'
              className='w-full bg-slate-100 text-slate-950 hover:bg-white disabled:bg-slate-700 disabled:text-slate-400 disabled:hover:bg-slate-700'
              disabled={form.formState.isSubmitting || !form.formState.isValid}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Please wait
                </>
              ) : (
                <>
                  Create account
                  <ShieldEllipsis className='h-4 w-4' />
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className='mt-6 text-center text-sm text-slate-400'>
          Already a member?
          <Link
            href='/login'
            className='ml-1 font-medium text-blue-400 hover:text-blue-300'>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
