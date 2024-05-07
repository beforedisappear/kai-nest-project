import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { CartService } from '@/cart/cart.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cartService: CartService,
  ) {}

  getAll(userId: string) {
    return this.prismaService.order.findMany({
      where: {
        userId,
      },
      include: { cards: true },
    });
  }

  async create(userId: string) {
    const cards = await this.cartService.getAll(userId);

    if (cards.length === 0) throw new ConflictException();

    const res = await this.prismaService.order.create({
      data: {
        userId,
        cards: {
          connect: cards.map((card) => ({ id: card.id })),
        },
      },
    });

    await this.cartService.clear(userId);

    return res;
  }

  async cancel(userId: string, orderId: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId, userId: userId },
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    } else if (order.id != orderId || !order.isActive) {
      throw new ConflictException();
    }

    return this.prismaService.order.update({
      where: { id: orderId, userId: userId },
      data: { isActive: false },
    });
  }
}
