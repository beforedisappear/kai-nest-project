import {
  Get,
  Param,
  Delete,
  UseGuards,
  Controller,
  ParseUUIDPipe,
  UseInterceptors,
  ConflictException,
  NotFoundException,
  ClassSerializerInterceptor,
} from '@nestjs/common';

import { UserService } from './user.service';
import { ApiBearerAuth, ApiExcludeController } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { UserResponse } from './responses';

@ApiExcludeController()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':idOrPhoneNumber')
  async findOnerUser(@Param('idOrPhoneNumber') idOrPhoneNumber: string) {
    const user = await this.userService.findOne(idOrPhoneNumber);

    if (user) return new UserResponse(user);
    else throw new NotFoundException();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userService.findOne(id);

    if (!user) throw new ConflictException();

    return this.userService.delete(id);
  }
}
