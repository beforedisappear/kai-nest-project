import { UserJwtPayload } from './interfaces';
import { Request as HttpRequest } from 'express';

export type AuthRequest = HttpRequest & { user: UserJwtPayload };
