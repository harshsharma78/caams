import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      role: 'admin' | 'assessor';
    };
  }

  interface User {
    role: 'admin' | 'assessor';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'admin' | 'assessor';
  }
}
