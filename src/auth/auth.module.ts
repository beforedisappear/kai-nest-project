import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '@/user/user.module';
import { options } from './config';

import { STRATEGIES } from './strategies';
import { GUARDS } from './guards';

@Module({
  controllers: [AuthController],
  imports: [PassportModule, UserModule, JwtModule.registerAsync(options())],
  providers: [AuthService, ...STRATEGIES, ...GUARDS],
  exports: [JwtModule],
})
export class AuthModule {}
