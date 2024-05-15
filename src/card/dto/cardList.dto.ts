import { ApiProperty } from '@nestjs/swagger';

import { CardType } from '../card.types';
import { IsOptional, IsString } from 'class-validator';

export class CardListDto {
  @ApiProperty()
  @IsString()
  page: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  offset?: string;

  @ApiProperty({
    enum: CardType,
    description: 'type of card',
    required: false,
  })
  @IsString()
  @IsOptional()
  type?: CardType;
}
