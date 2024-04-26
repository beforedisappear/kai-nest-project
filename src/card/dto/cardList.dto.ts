import { ApiProperty } from '@nestjs/swagger';

import { CardType } from '../card.types';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CardListDto {
  @ApiProperty()
  @IsNumber()
  page: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  offset?: number;

  @ApiProperty({
    enum: CardType,
    description: 'type of card',
    required: false,
  })
  @IsString()
  @IsOptional()
  type?: CardType;
}
