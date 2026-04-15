import bcrypt from 'bcryptjs';
import NextAuth, { type DefaultSession, type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { dbConnect } from '@/lib/db';
import { loginSchema } from '@/lib/validations';
import User from '@/models/User';

export type AppSessionUser = DefaultSession['user'] & {
  id: string;
  role: 'admin' | 'viewer';
};

/**
 * Central NextAuth configuration for credentials-based authentication.
 */
export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        await dbConnect();

        const user = await User.findOne({
          email: parsed.data.email.toLowerCase(),
        }).lean();

        if (!user) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          parsed.data.password,
          user.password,
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role ?? 'admin';
        token.name = user.name;
        token.email = user.email;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as AppSessionUser['role'];
        session.user.name = token.name ?? session.user.name;
        session.user.email = token.email ?? session.user.email;
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
