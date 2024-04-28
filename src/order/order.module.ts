import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CartService } from '@/cart/cart.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, CartService],
})
export class OrderModule {}
