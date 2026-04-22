import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      role: 'admin' | 'analyst' | 'viewer' | 'org_manager';
    };
  }

  interface User {
    role: 'admin' | 'analyst' | 'viewer' | 'org_manager';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'admin' | 'analyst' | 'viewer' | 'org_manager';
  }
}
