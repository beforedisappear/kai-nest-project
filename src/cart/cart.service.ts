import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll(userId: string) {
    const cardsInCart = await this.prismaService.cart.findUnique({
      where: { userId },
      include: { cards: true },
    });

    return cardsInCart.cards;
  }

  async add(id: string, userId: string) {
    const res = await this.prismaService.cart.upsert({
      where: { userId },
      update: {
        cards: { connect: { id } },
      },
      create: {
        id: userId,
        user: { connect: { id: userId } },
        cards: { connect: [{ id }] },
      },
    });

    return { id: res.id };
  }

  async remove(id: string, userId: string) {
    const res = await this.prismaService.cart.update({
      where: { userId },
      data: { cards: { disconnect: { id } } },
      include: { user: true, cards: true },
    });

    return { id: res.id };
  }

  async clear(userId: string) {
    const userCart = await this.prismaService.cart.findUnique({
      where: { userId },
      include: { cards: true },
    });

    if (!userCart) {
      throw new ConflictException('Корзина пользователя не найдена');
    } else if (userCart.cards.length === 0) {
      throw new NotFoundException('Корзина пустая');
    }

    await this.prismaService.cart.update({
      where: { id: userCart.id },
      data: {
        cards: { disconnect: userCart.cards.map((card) => ({ id: card.id })) },
      },
    });
  }
}
