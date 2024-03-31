import {
  IsPhoneNumber,
  MinLength,
  IsNotEmpty,
  IsString,
  Validate,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { IsPasswordsMatchingConstraint } from 'libs/common/src/decorators';

export class RegisterDto {
  @ApiProperty()
  @IsPhoneNumber('RU')
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  @Validate(IsPasswordsMatchingConstraint)
  @IsNotEmpty()
  passwordRepeat: string;
}
