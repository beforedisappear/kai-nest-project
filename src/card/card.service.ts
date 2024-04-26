import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { CreateCardDto } from './dto/createCard.dto';
import { CardListDto } from './dto/cardList.dto';

@Injectable()
export class CardService {
  constructor(private readonly prismaService: PrismaService) {}

  create(card: CreateCardDto) {
    return this.prismaService.card.create({ data: card });
  }

  async getAllOrByType({ page, offset = 10, type }: CardListDto) {
    const skip = (page - 1) * offset;

    const cards = await this.prismaService.card.findMany({
      skip,
      take: offset,
      orderBy: { id: 'asc' }, // или любое другое поле для сортировки
      ...(type && { where: { type } }),
    });

    return cards;
  }

  async getOneById(id: string) {
    const card = await this.prismaService.card.findFirst({ where: { id } });

    if (!card) null;

    return card;
  }
}
