import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  // Post,
  // Delete,
  // Body,
  Param,
  UseGuards,
  UseInterceptors,
  // ParseUUIDPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiExcludeController } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { UserResponse } from './responses';

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

  // @Post()
  // createUser(@Body() dto) {
  //   return this.userService.save(dto);
  // }

  // @Delete(':id')
  // deleteUser(@Param('id', ParseUUIDPipe) id: string) {
  //   return this.userService.delete(id);
  // }
}
