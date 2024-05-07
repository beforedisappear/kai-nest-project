import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CancelOrder {
  @ApiProperty()
  @IsUUID()
  orderId: string;
}
