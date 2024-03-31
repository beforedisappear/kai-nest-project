import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  save(user: Partial<User>) {
    return this.prismaService.user.create({
      data: { phoneNumber: user.phoneNumber },
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

  // delete(id: string) {
  //   return this.prismaService.user.delete({ where: { id } });
  // }
}
