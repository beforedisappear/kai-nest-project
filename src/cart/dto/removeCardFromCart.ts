import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class RemoveCardFromCart {
  @ApiProperty()
  @IsUUID()
  cardId: string;
}
