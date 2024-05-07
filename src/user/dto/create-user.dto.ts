import { IsPhoneNumber } from 'class-validator';

export class CreateUserDto {
  @IsPhoneNumber('RU')
  phoneNumber: string;

  password: string;
}
