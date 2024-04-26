import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

import { CardType } from '../card.types';

export class CreateCardDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  @IsUrl()
  imageUrl: string;

  @ApiProperty()
  @IsString()
  type: CardType;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  price: number | null;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  weight: number | null;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  kcal: number | null;

  @ApiProperty()
  @ArrayMinSize(1)
  @IsString({ each: true })
  components: string[];
}
