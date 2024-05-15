import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
  ValidationPipe
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CartService } from './cart.service';

import { AddCardToCart } from './dto/addCardToCart';
import { RemoveCardFromCart } from './dto/removeCardFromCart';

import type { AuthRequest } from '@/auth/types';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('get-cards-in-cart')
  getCart(@Req() req: AuthRequest) {
    return this.cartService.getAll(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @Post('add-card-to-cart')
  addCardToCart(
    @Req() req: AuthRequest,
    @Body(new ValidationPipe()) { cardId }: AddCardToCart,
  ) {
    return this.cartService.add(cardId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @Post('remove-card-from-cart')
  removeCardFromCart(
    @Req() req: AuthRequest,
    @Body(new ValidationPipe()) { cardId }: RemoveCardFromCart,
  ) {
    return this.cartService.remove(cardId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('clear-cart')
  @HttpCode(201)
  clearCart(@Req() req: AuthRequest) {
    return this.cartService.clear(req.user.id);
  }
}
