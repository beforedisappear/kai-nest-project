import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { genSaltSync, hashSync } from 'bcrypt';

import type { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  save(user: Partial<User>) {
    const hasedPassword = this.hashPassword(user.password);

    return this.prismaService.user.create({
      data: { phoneNumber: user.phoneNumber, password: hasedPassword },
    });
  }

  //find by id or phone number
  findOne(idOrPhoneNumber: string) {
    return this.prismaService.user.findFirst({
      where: {
        OR: [{ id: idOrPhoneNumber }, { phoneNumber: idOrPhoneNumber }],
      },
    });
  }

  private hashPassword(password: string) {
    return hashSync(password, genSaltSync(10));
  }

  // delete(id: string) {
  //   return this.prismaService.user.delete({ where: { id } });
  // }
}
