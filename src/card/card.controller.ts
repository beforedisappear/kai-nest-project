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
} from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/createCard.dto';
import { CardListDto } from './dto/cardList.dto';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get('list')
  async getCardList(@Query() allQueryParams: CardListDto) {
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
  async addCard(@Body() dto: CreateCardDto) {
    try {
      const res = await this.cardService.create(dto);

      return res;
    } catch (e) {
      console.log(e);
      throw new BadRequestException();
    }
  }
}
