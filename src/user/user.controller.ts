import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  ParseUUIDPipe,
  ConflictException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiExcludeController } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { UserResponse } from './responses';
import { CreateUserDto } from './dto/create-user.dto';

// @ApiExcludeController()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':idOrPhoneNumber')
  async findOnerUser(@Param('idOrPhoneNumber') idOrPhoneNumber: string) {
    const user = await this.userService.findOne(idOrPhoneNumber);
    return new UserResponse(user);
  }

  @Post()
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.save(dto);
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userService.findOne(id);

    if (!user) throw new ConflictException();

    return this.userService.delete(id);
  }
}
