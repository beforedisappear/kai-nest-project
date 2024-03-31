import { UserService } from '@/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';

import { v4 } from 'uuid';
import { add } from 'date-fns';
import { compareSync } from 'bcrypt';

import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto, LogoutDto, RefreshTokensDto, RegisterDto } from './dto';

import type { JWT, User } from '@prisma/client';
import type { Tokens } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  private async getRefreshToken(userId: string, agent: string): Promise<JWT> {
    const data = await this.prismaService.jWT.findFirst({
      where: { userId, userAgent: agent },
    });

    const token = data?.token ?? '';

    return this.prismaService.jWT.upsert({
      where: { token },
      update: {
        token: v4(),
        exp: add(new Date(), { months: 1 }),
      },
      create: {
        token: v4(),
        exp: add(new Date(), { months: 1 }),
        userId,
        userAgent: agent,
      },
    });
  }

  private async generateTokens(user: User, agent: string) {
    const accessToken = this.jwtService.sign({
      id: user.id,
      phoneNumber: user.phoneNumber,
    });

    const refreshToken = await this.getRefreshToken(user.id, agent);

    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const user: User = await this.userService
      .findOne(dto.phoneNumber)
      .catch((err) => {
        this.logger.error(err);
        return null;
      });

    if (user) {
      throw new ConflictException(
        `Пользователь с таким номером уже существует!`,
      );
    }

    return this.userService.save(dto).catch((err) => {
      this.logger.error(err);
      return null;
    });
  }

  async login(dto: LoginDto, agent: string): Promise<Tokens> {
    const user: User = await this.userService
      .findOne(dto.phoneNumber)
      .catch((err) => {
        this.logger.error(err);
        return null;
      });

    if (!user || !compareSync(dto.password, user.password)) {
      throw new UnauthorizedException('Неверный номер или пароль');
    }

    return this.generateTokens(user, agent);
  }

  async refreshTokens(dto: RefreshTokensDto, agent: string): Promise<Tokens> {
    const token = await this.prismaService.jWT.findUnique({
      where: { token: dto.refreshToken },
    });

    if (!token) {
      throw new UnauthorizedException();
    }

    await this.prismaService.jWT.delete({
      where: { token: dto.refreshToken },
    });

    if (new Date(token.exp) < new Date()) {
      throw new UnauthorizedException('Сессия истекла');
    }

    const user = await this.userService.findOne(token.userId);

    return this.generateTokens(user, agent);
  }

  async logout(dto: LogoutDto) {
    const token = await this.prismaService.jWT.delete({
      where: { token: dto.refreshToken },
    });

    if (!token) throw new UnauthorizedException();

    return null;
  }
}
