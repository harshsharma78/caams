import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required.')
  .email('Enter a valid email address.');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(64, 'Password must be 64 characters or fewer.')
  .regex(/[A-Z]/, 'Password must include at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must include at least one lowercase letter.')
  .regex(/\d/, 'Password must include at least one number.');

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(60, 'Name must be 60 characters or fewer.'),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['admin', 'viewer']),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required.').max(64),
});

export const organizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Organization name is required.')
    .max(100, 'Organization name must be 100 characters or fewer.'),
  industry: z
    .string()
    .trim()
    .min(2, 'Industry is required.')
    .max(60, 'Industry must be 60 characters or fewer.'),
  size: z.enum(['startup', 'sme', 'enterprise']),
  sector: z
    .string()
    .trim()
    .min(2, 'Sector is required.')
    .max(60, 'Sector must be 60 characters or fewer.'),
  address: z
    .string()
    .trim()
    .min(5, 'Address is required.')
    .max(200, 'Address must be 200 characters or fewer.'),
  contactPerson: z
    .string()
    .trim()
    .min(2, 'Contact person is required.')
    .max(60, 'Contact person must be 60 characters or fewer.'),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .min(7, 'Phone number is required.')
    .max(20, 'Phone number must be 20 characters or fewer.')
    .regex(/^[+\d\s()-]+$/, 'Enter a valid phone number.'),
  logoUrl: z.url('Logo URL must be valid.').or(z.literal('')).default(''),
});

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID.');
