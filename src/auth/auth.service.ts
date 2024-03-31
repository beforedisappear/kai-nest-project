import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { AuthDto } from '@/auth/dto';
import { UserService } from '@/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { JWT, User } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { v4 } from 'uuid';
import { Tokens } from './interfaces';
import { add } from 'date-fns';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async auth(dto: AuthDto): Promise<User | Tokens> {
    if (dto.code != '1111') {
      throw new ConflictException('неверный код');
    }

    const user: User = await this.userService
      .findOne(dto.phoneNumber)
      .catch((err) => {
        this.logger.error(err);
        return null;
      });

    if (!user) {
      return this.userService.save(dto).catch((err) => {
        this.logger.error(err);
        return null;
      });
    } else {
      const accessToken = this.jwtService.sign({
        id: user.id,
        phoneNumber: user.phoneNumber,
      });

      const refreshToken = await this.getRefreshToken(user.id);

      return { accessToken, refreshToken };
    }
  }

  private async getRefreshToken(userId: string): Promise<JWT> {
    return this.prismaService.jWT.create({
      data: { token: v4(), exp: add(new Date(), { months: 1 }), userId },
    });
  }
}
