import { PrismaService } from '@/prisma/prisma.service';
import { Inject, Injectable } from '@nestjs/common';
import { genSaltSync, hashSync } from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import type { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  save(user: CreateUserDto) {
    const hashedPassword = this.hashPassword(user.password);

    return this.prismaService.user.create({
      data: { phoneNumber: user.phoneNumber, password: hashedPassword },
    });
  }

  //find by id or phone number
  async findOne(idOrPhoneNumber: string, isReset = false) {
    if (isReset) await this.cacheManager.del(idOrPhoneNumber);

    let cachedUser = await this.cacheManager.get<User>(idOrPhoneNumber);

    if (!cachedUser) {
      cachedUser = await this.prismaService.user.findFirst({
        where: {
          OR: [{ id: idOrPhoneNumber }, { phoneNumber: idOrPhoneNumber }],
        },
      });

      if (!cachedUser) return null;

      await this.cacheManager.set(idOrPhoneNumber, cachedUser, 86400);
    }

    return cachedUser;
  }

  hashPassword(password: string) {
    return hashSync(password, genSaltSync(10));
  }

  delete(id: string) {
    return this.prismaService.user.delete({ where: { id } });
  }
}
