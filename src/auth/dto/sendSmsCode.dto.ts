import { IsPhoneNumber } from 'class-validator';

export class SendSmsCodeDto {
  @IsPhoneNumber('RU')
  phoneNumber: string;
}
