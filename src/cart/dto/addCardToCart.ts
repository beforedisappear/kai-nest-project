import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddCardToCart {
  @ApiProperty()
  @IsUUID()
  cardId: string;
}
