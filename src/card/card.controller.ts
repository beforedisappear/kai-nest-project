import {
  Get,
  Post,
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseUUIDPipe,
  Param,
  NotFoundException,
  Body,
  BadRequestException,
  HttpCode,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/createCard.dto';
import { CardListDto } from './dto/cardList.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('card')
@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get('list')
  async getCardList(@Query(new ValidationPipe()) allQueryParams: CardListDto) {
    const cardList = await this.cardService.getAllOrByType(allQueryParams);

    return { cardList, count: cardList.length };
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async getCardById(@Param('id', ParseUUIDPipe) id: string) {
    const card = await this.cardService.getOneById(id);

    if (!card) throw new NotFoundException();

    return card;
  }

  @Post('add-card')
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(200)
  async addCard(@Body(new ValidationPipe()) dto: CreateCardDto) {
    try {
      const res = await this.cardService.create(dto);

      return res;
    } catch (e) {
      console.error(e);
      throw new BadRequestException();
    }
  }
}
