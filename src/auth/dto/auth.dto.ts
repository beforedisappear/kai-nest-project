import { IsNumberString, IsPhoneNumber, Length } from 'class-validator';

export class AuthDto {
  @IsPhoneNumber('RU')
  phoneNumber: string;
  @IsNumberString()
  @Length(4)
  code: string;
}
