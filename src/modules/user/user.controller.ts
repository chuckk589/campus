import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller({
  path: 'user',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // // @Get(':id')
  // // findOne(@Param('id') id: string) {
  // //   return this.userService.findOne(+id);
  // // }
  // @Get('/banned')
  // findAllBanned() {
  //   return this.userService.findAllBanned();
  // }

  // @Put('/banned/:id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.updateBannedUser(+id, updateUserDto);
  // }

  // @Post('/banned/')
  // banUser(@Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.banUser(updateUserDto);
  // }
}
