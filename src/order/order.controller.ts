import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { AuthRequest } from '@/auth/types';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CancelOrder } from './dto/cancelOrder.dto';

@ApiTags('order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('get-orders')
  getOrders(@Req() req: AuthRequest) {
    return this.orderService.getAll(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('create-order')
  createOrder(@Req() req: AuthRequest) {
    return this.orderService.create(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('cancel-order')
  cancelOrder(@Req() req: AuthRequest, @Body() dto: CancelOrder) {
    return this.orderService.cancel(req.user.id, dto.orderId);
  }
}
