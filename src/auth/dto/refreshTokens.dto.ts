import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokensDto {
  @ApiProperty()
  @IsUUID()
  refreshToken: string;
}
