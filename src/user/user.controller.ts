import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createUser(@Body() dto) {
    return this.userService.save(dto);
  }

  @Get(':idOrPhoneNumber')
  findOnerUser(@Param('idOrPhoneNumber') idOrPhoneNumber: string) {
    return this.userService.findOne(idOrPhoneNumber);
  }

  // @Delete(':id')
  // deleteUser(@Param('id', ParseUUIDPipe) id: string) {
  //   return this.userService.delete(id);
  // }
}
