import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CardModule } from './card/card.module';
import { CartController } from './cart/cart.controller';
import { CartService } from './cart/cart.service';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    CardModule,
    CartModule,
    OrderModule,
  ],
  controllers: [AppController, CartController],
  providers: [AppService, CartService],
})
export class AppModule {}
