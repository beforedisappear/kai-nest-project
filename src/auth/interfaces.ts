import { JWT } from '@prisma/client';

export interface Tokens {
  accessToken: string;
  refreshToken: JWT;
}

export interface JwtPayload {
  id: string;
  phoneNumber: string;
}

export interface UserJwtPayload {
  id: string;
}
