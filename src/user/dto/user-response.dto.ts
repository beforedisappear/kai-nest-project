import { Exclude } from 'class-transformer';
import type { User } from '@prisma/client';

export class UserResponse implements User {
  id: string;
  phoneNumber: string;

  @Exclude()
  password: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  constructor(user: User) {
    Object.assign(this, user);
  }
}
