import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      role: 'admin' | 'viewer';
    };
  }

  interface User {
    role: 'admin' | 'viewer';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'admin' | 'viewer';
  }
}
