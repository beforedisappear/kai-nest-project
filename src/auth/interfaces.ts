import { JWT } from '@prisma/client';

export interface Tokens {
  accessToken: string;
  refreshToken: JWT;
}

export interface JwtPayload {
  id: string;
  email: string;
  roles: string[];
}
