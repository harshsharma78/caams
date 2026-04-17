import bcrypt from 'bcryptjs';
import NextAuth, { type DefaultSession, type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

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
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account?.provider) return true;

      await dbConnect();

      const existingUser = await User.findOne({
        email: user.email,
      });

      if (!existingUser) {
        await User.create({
          name: user.name,
          email: user.email,
          provider: account.provider, // works for google & github
          role: 'viewer',
        });
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role ?? 'viewer';
        token.name = user.name;
        token.email = user.email;
      }

      // For OAuth providers, fetch the user role from database
      if (account?.provider === 'github' || account?.provider === 'google') {
        if (!token.role || token.role === undefined) {
          await dbConnect();
          const dbUser = await User.findById(token.sub).lean();
          if (dbUser) {
            token.role = dbUser.role || 'viewer';
          }
        }
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
