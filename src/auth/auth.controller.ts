import { AuthService } from './auth.service';

import { UserAgent } from '../../libs/common/src/decorators/user-agent.decorator';

import {
  Controller,
  Post,
  Body,
  HttpCode,
  BadRequestException,
  UnauthorizedException,
  UseInterceptors,
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';

import { LoginDto, LogoutDto, RefreshTokensDto, RegisterDto } from '@/auth/dto';

import type { User } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { UserResponse } from '@/user/dto/user-response.dto';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseInterceptors(ClassSerializerInterceptor)
  async register(@Body(new ValidationPipe()) dto: RegisterDto) {
    const user: User | null = await this.authService.register(dto);

    if (!user) {
      throw new BadRequestException(
        `Ошибка регистрации. Пользователь с номером ${JSON.stringify(dto.phoneNumber)} уже существует`,
      );
    }

    return new UserResponse(user);
  }

  @Post('login')
  async login(
    @Body(new ValidationPipe()) dto: LoginDto,
    @UserAgent() agent: string,
  ) {
    const tokens = await this.authService.login(dto, agent);

    if (!tokens) {
      throw new BadRequestException('Данные неверны');
    }

    return {
      accessToken: tokens.accessToken,
      exp: tokens.refreshToken.exp,
      refreshToken: tokens.refreshToken.token,
    };
  }

  @Post('refresh-tokens')
  refreshTokens(
    @Body(new ValidationPipe()) dto: RefreshTokensDto,
    @UserAgent() agent: string,
  ) {
    const newTokens = this.authService.refreshTokens(dto, agent);

    if (!newTokens) throw new UnauthorizedException('Ошибка авторизации');

    return newTokens;
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Body(new ValidationPipe()) dto: LogoutDto) {
    return this.authService.logout(dto);
  }
}
