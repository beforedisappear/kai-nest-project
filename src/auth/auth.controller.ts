import { Body, Controller, Post } from '@nestjs/common';
import {
  AuthDto,
  LogoutDto,
  RefreshTokensDto,
  SendSmsCodeDto,
} from '@/auth/dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sendSmsCode')
  sendSmsCode(@Body() dto: SendSmsCodeDto) {}

  @Post('auth')
  auth(@Body() dto: AuthDto) {}

  @Post('refreshTokens')
  refreshTokens(@Body() dto: RefreshTokensDto) {}

  @Post('logout')
  logout(@Body() dto: LogoutDto) {}
}
