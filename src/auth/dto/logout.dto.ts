import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty()
  @IsUUID()
  refreshToken: string;
}
