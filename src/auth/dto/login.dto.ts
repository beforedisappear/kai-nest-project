import { ApiProperty } from '@nestjs/swagger';

import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsPhoneNumber('RU')
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  @IsNotEmpty()
  password: string;
}
